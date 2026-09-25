import { readFile } from "node:fs/promises";
const BASE_URL = (process.env.PROXYAPI_BASE_URL ?? "https://api.proxyapi.ru/v1").trim();

function getApiKey() {
  const key = (process.env.PROXYAPI_API_KEY ?? "").trim();
  if (!key) throw new Error("PROXYAPI_API_KEY не задан в окружении");
  return key;
}

async function createEmbedding(input, maxRetries = 5) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const res = await fetch(`${BASE_URL}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify({
          model: (process.env.PROXYAPI_EMBEDDING_MODEL ?? "openai/text-embedding-3-small").trim(),
          input,
        }),
      });
      if (res.status === 429 || res.status >= 500) {
        const detail = await res.text().catch(() => "");
        throw new Error(`ProxyAPI embeddings HTTP ${res.status} (retryable): ${detail.slice(0, 200)}`);
      }
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`ProxyAPI embeddings HTTP ${res.status}: ${detail.slice(0, 300)}`);
      }
      const data = await res.json();
      const rows = (data.data ?? []).slice().sort((a, b) => a.index - b.index);
      if (rows.length === 0) throw new Error("ProxyAPI embeddings: пустой ответ (retryable)");
      return rows.map((r) => r.embedding);
    } catch (err) {
      lastError = err;
      const retryable = /retryable|fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN/i.test(
        err instanceof Error ? err.message : String(err)
      );
      if (!retryable || attempt === maxRetries) throw err;
      const delay = Math.min(3000 * 2 ** (attempt - 1), 30000);
      console.warn(`  embeddings: попытка ${attempt}/${maxRetries} не удалась (${err instanceof Error ? err.message.slice(0, 80) : err}), повтор через ${delay}мс...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

/**
 * Загрузка корпуса в базу с юридическими воротами:
 * 1. Создает или находит запись в law_documents.
 * 2. Создает запись в law_document_editions со статусом 'draft'.
 * 3. Генерирует эмбеддинги через ProxyAPI (openai/text-embedding-3-small).
 * 4. Загружает чанки в law_chunks с привязкой к edition_id.
 * 5. Активирует редакцию (status = 'active') ТОЛЬКО при флаге --activate
 *    и указании рецензента (--reviewed-by="ФИО/Юрист").
 * 
 * Без --activate редакция остается в статусе draft и НЕ участвует в поиске.
 */

export async function loadDocumentEdition(dbClient, parsedDoc, options = {}) {
  const { activate = false, reviewedBy = null, dryRun = false } = options;

  if (activate && !reviewedBy) {
    throw new Error("Активация редакции невозможна без указания --reviewed-by (юридический рецензент)");
  }

  console.log(`\nОбработка документа: ${parsedDoc.code} (${parsedDoc.title})`);

  if (dryRun) {
    console.log(`[DRY-RUN] Чанков для обработки: ${parsedDoc.chunks.length}`);
    console.log(`[DRY-RUN] Статус редакции: ${activate ? "active" : "draft"}`);
    return { documentId: "dry-run", editionId: "dry-run", chunksCount: parsedDoc.chunks.length };
  }

  // 1. Создаем или получаем law_documents
  const { rows: docRows } = await dbClient.query(
    `INSERT INTO public.law_documents (code, title, nd, official_source_url, source_name, source_license)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (nd) DO UPDATE SET
       title = EXCLUDED.title,
       official_source_url = EXCLUDED.official_source_url,
       updated_at = NOW()
     RETURNING id`,
    [
      parsedDoc.code,
      parsedDoc.title,
      parsedDoc.nd,
      parsedDoc.officialSourceUrl,
      parsedDoc.sourceName || "pravo.gov.ru",
      parsedDoc.sourceLicense || "Официальные открытые данные pravo.gov.ru"
    ]
  );
  const documentId = docRows[0].id;

  // 2. Создаем law_document_editions (по умолчанию draft)
  const initialStatus = activate ? "active" : "draft";
  const effectiveFrom = activate ? new Date().toISOString().split("T")[0] : null;

  const { rows: edRows } = await dbClient.query(
    `INSERT INTO public.law_document_editions (
       document_id, status, edition_date, effective_from, source_url,
       source_retrieved_at, source_sha256, parser_version, content_sha256,
       legal_reviewed_at, legal_reviewed_by
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (document_id, content_sha256) DO UPDATE SET
        status = CASE WHEN $2 = 'active' THEN 'active' ELSE law_document_editions.status END,
        edition_date = COALESCE($3, law_document_editions.edition_date),
        effective_from = CASE WHEN $2 = 'active' THEN COALESCE($4, law_document_editions.effective_from) ELSE law_document_editions.effective_from END,
        legal_reviewed_at = CASE WHEN $2 = 'active' THEN NOW() ELSE law_document_editions.legal_reviewed_at END,
        legal_reviewed_by = CASE WHEN $2 = 'active' THEN $11 ELSE law_document_editions.legal_reviewed_by END
     RETURNING id, status`,
    [
      documentId,
      initialStatus,
      parsedDoc.editionDate || null,
      effectiveFrom,
      // Редакция: точный URL архива (provenance байтов).
      parsedDoc.archiveUrl || parsedDoc.sourceUrl,
      parsedDoc.sourceRetrievedAt,
      parsedDoc.sourceSha256,
      parsedDoc.parserVersion,
      parsedDoc.contentSha256,
      activate ? new Date().toISOString() : null,
      reviewedBy
    ]
  );
  const editionId = edRows[0].id;
  console.log(`Редакция ID: ${editionId}, статус: ${edRows[0].status}`);

  // 3. Батчевая генерация эмбеддингов и загрузка чанков.
  // Неизменные чанки (текст совпал, эмбеддинг есть) пропускаем без вызова API.
  const { rows: existingRows } = await dbClient.query(
    `SELECT chunk_index, chunk FROM public.law_chunks WHERE edition_id = $1`,
    [editionId]
  );
  const existingByIndex = new Map(existingRows.map((r) => [Number(r.chunk_index), r.chunk]));
  const BATCH_SIZE = 20;
  let insertedChunks = 0;
  let skippedChunks = 0;

  for (let i = 0; i < parsedDoc.chunks.length; i += BATCH_SIZE) {
    const chunkBatch = parsedDoc.chunks.slice(i, i + BATCH_SIZE);
    const pending = [];
    const skippedMeta = [];
    for (let j = 0; j < chunkBatch.length; j++) {
      const existing = existingByIndex.get(i + j);
      if (existing && existing.chunk === chunkBatch[j].chunk) {
        skippedMeta.push({ c: chunkBatch[j], chunkIndex: i + j });
        continue;
      }
      pending.push({ c: chunkBatch[j], chunkIndex: i + j });
    }
    // Неизменным чанкам обновляем только метаданные (без нового эмбеддинга).
    for (const { c, chunkIndex } of skippedMeta) {
      await dbClient.query(
        `UPDATE public.law_chunks SET edition_date = $1, heading = $2, locator = $3,
           source_url = $4, content_sha256 = $5, parser_version = $6
         WHERE edition_id = $7 AND chunk_index = $8`,
        [
          parsedDoc.editionDate || null,
          c.heading || c.article,
          c.locator,
          parsedDoc.sourceUrl,
          parsedDoc.contentSha256,
          parsedDoc.parserVersion,
          editionId,
          chunkIndex,
        ]
      );
      skippedChunks++;
    }
    if (pending.length === 0) {
      insertedChunks += chunkBatch.length;
      continue;
    }
    const textsToEmbed = pending.map((p) => `${p.c.article}\n${p.c.chunk}`);

    console.log(`  Генерация эмбеддингов для чанков ${i + 1}..${i + chunkBatch.length}...`);
    const embeddings = await createEmbedding(textsToEmbed);

    for (let j = 0; j < pending.length; j++) {
      const { c, chunkIndex } = pending[j];
      const emb = embeddings[j];

      await dbClient.query(
        `INSERT INTO public.law_chunks (
           code, article, chunk, edition_date, is_active, embedding,
           edition_id, chunk_index, heading, locator, source_url,
           content_sha256, parser_version
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (edition_id, chunk_index) DO UPDATE SET
           chunk = EXCLUDED.chunk,
           embedding = EXCLUDED.embedding,
           heading = EXCLUDED.heading,
           locator = EXCLUDED.locator,
           source_url = EXCLUDED.source_url`,
        [
          parsedDoc.code,
          c.article,
          c.chunk,
          parsedDoc.editionDate || null,
          true,
          `[${emb.join(",")}]`,
          editionId,
          chunkIndex,
          c.heading || c.article,
          c.locator,
          parsedDoc.sourceUrl,
          parsedDoc.contentSha256,
          parsedDoc.parserVersion
        ]
      );
      insertedChunks++;
    }
  }

  // 4. Удаляем чанки-сироты (индексы, которых больше нет в новом парсинге).
  const validIndexes = parsedDoc.chunks.map((_, idx) => idx);
  const del = await dbClient.query(
    `DELETE FROM public.law_chunks WHERE edition_id = $1 AND NOT (chunk_index = ANY($2))`,
    [editionId, validIndexes]
  );

  console.log(`✓ Актуальных чанков: ${insertedChunks} (эмбеддингов сэкономлено: ${skippedChunks}, сирот удалено: ${del.rowCount})`);
  return { documentId, editionId, chunksCount: insertedChunks };
}
