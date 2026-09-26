/**
 * Системный промпт AI-юриста + проверка цитат.
 * Ключевое правило MVP: пока RAG-база пуста, модели ЗАПРЕЩЕНО называть
 * номера статей по памяти — только общие формулировки + честное
 * «точные нормы нужно проверить». Это защита от галлюцинаций уровня
 * «штраф за выдуманный прецедент».
 */

export interface LawChunk {
  id: number;
  code: string;
  article: string;
  chunk: string;
  edition_date: string | null;
  source_url?: string | null;
  edition_id?: string | null;
  locator?: string | null;
}

export const AI_SYSTEM_PROMPT = `Ты — AI-юрист сервиса Dogovor.expert. Отвечаешь по-русски, просто, без канцелярита.

СТРОГИЕ ПРАВИЛА ДОСТОВЕРНОСТИ:
1. Если приложен раздел КОНТЕКСТ с фрагментами законов — опирайся ТОЛЬКО на него. Цитаты и номера статей бери только оттуда.
2. Если КОНТЕКСТА нет или его недостаточно — НЕ называй номера статей, пунктов и частей по памяти. Объясни общий порядок действий и честно напиши: «Точные нормы нужно проверить — уточните вопрос или приложите документ».
3. Структура ответа: «Коротко» (1-2 предложения) → разбор по пунктам → «Что делать дальше» (1-3 шага).
4. В конце — одна строка: «Информация общего характера, не юридическая консультация».
5. Никогда не обещай исход дела, не говори «100%», «гарантированно», «вы выиграете».
6. Маскируй персональные данные: не проси паспорт, адрес, телефон — для ответа они не нужны.`;

export const AI_AUDIT_SYSTEM_PROMPT = `Ты — AI-аудитор договоров сервиса Dogovor.expert. Отвечаешь по-русски, просто, без канцелярита.

ЗАДАЧА: разобрать приложенный ТЕКСТ ДОГОВОРА и вернуть структурированный отчёт.

СТРОГИЕ ПРАВИЛА ДОСТОВЕРНОСТИ (те же, что у AI-юриста):
1. Если приложен раздел КОНТЕКСТ с фрагментами законов — опирайся ТОЛЬКО на него. Номера статей бери только оттуда.
2. Если КОНТЕКСТА нет или его недостаточно — НЕ называй номера статей, пунктов и частей по памяти. Опиши риск общими словами и честно напиши: «Точную норму нужно проверить».
3. Никогда не обещай исход дела, не говори «100%», «гарантированно», «вы выиграете».

ФОРМАТ ОТВЕТА — строго JSON в блоке \`\`\`json ... \`\`\`, без текста вне блока:
{
  "score": <целое 0-100: индекс безопасности договора>,
  "verdict": "<одна из строк: 'Безопасен' | 'Незначительные замечания' | 'Требуются правки' | 'Высокий риск'>",
  "summary": "<2-3 предложения: главные проблемы>",
  "findings": [
    {
      "type": "<'critical' | 'warning' | 'good'>",
      "clause": "<номер пункта из текста, напр. 'п. 4.2'>",
      "title": "<короткий заголовок проблемы>",
      "problem": "<в чём риск, 1-2 предложения>",
      "law": "<норма из КОНТЕКСТА или '' если нормы нет>",
      "fix": "<безопасная формулировка пункта или 'Пункт не требует изменений.'>"
    }
  ]
}

ТРЕБОВАНИЯ К ОТЧЁТУ:
- Находок: от 1 до 8, сначала critical, затем warning, затем good (максимум 2 good).
- verdict по скору: 80+ «Безопасен», 60-79 «Незначительные замечания», 40-59 «Требуются правки», ниже 40 «Высокий риск».
- Отметь и хорошие пункты (type good), если они корректны, — не только проблемы.
- В конце findings НЕ добавляй дисклеймеры — клиент добавит их сам.`;

export interface AuditFinding {
  type: "critical" | "warning" | "good";
  clause: string;
  title: string;
  problem: string;
  law: string;
  fix: string;
}

export interface AuditReport {
  score: number;
  verdict: string;
  summary: string;
  findings: AuditFinding[];
}

const AUDIT_VERDICTS = ["Безопасен", "Незначительные замечания", "Требуются правки", "Высокий риск"];

/**
 * Достаёт JSON-отчёт аудита из ответа модели (блок ```json ... ``` или голый JSON).
 * Возвращает null, если распарсить не удалось, — клиент покажет fallback.
 * Поля нормализуются: score 0-100, type только из тройки, находок не больше 8.
 */
export function parseAuditReport(answer: string): AuditReport | null {
  const m = answer.match(/```json\s*([\s\S]*?)\s*```/) ?? answer.match(/(\{[\s\S]*\})/);
  if (!m) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(m[1]);
  } catch {
    return null;
  }
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const score = Math.max(0, Math.min(100, Math.round(Number(r.score) || 0)));
  const verdict =
    typeof r.verdict === "string" && AUDIT_VERDICTS.includes(r.verdict)
      ? r.verdict
      : score >= 80
        ? "Безопасен"
        : score >= 60
          ? "Незначительные замечания"
          : score >= 40
            ? "Требуются правки"
            : "Высокий риск";
  const findingsRaw = Array.isArray(r.findings) ? r.findings : [];
  const findings: AuditFinding[] = findingsRaw.slice(0, 8).map((f) => {
    const o = (typeof f === "object" && f !== null ? f : {}) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 1000) : "");
    return {
      type: o.type === "critical" || o.type === "warning" || o.type === "good" ? o.type : "warning",
      clause: str(o.clause).slice(0, 40) || "—",
      title: str(o.title).slice(0, 200) || "Замечание",
      problem: str(o.problem),
      law: str(o.law).slice(0, 200),
      fix: str(o.fix),
    };
  });
  if (findings.length === 0) return null;
  return {
    score,
    verdict,
    summary: typeof r.summary === "string" ? r.summary.slice(0, 2000) : "",
    findings,
  };
}

export function buildAuditUserMessage(contractText: string, chunks: LawChunk[]): string {
  const ctx =
    chunks.length === 0
      ? "(КОНТЕКСТ: релевантных фрагментов законов не найдено — действует правило 2: нормы по памяти не называть.)"
      : `КОНТЕКСТ (фрагменты действующих норм):\n${chunks
          .map((c, i) => {
            const source = c.source_url ? `; источник: ${c.source_url}` : "";
            return `[${i + 1}] ${c.code}, ${c.article} (ред. ${c.edition_date ?? "?"}${source}) : ${c.chunk}`;
          })
          .join("\n\n")}`;
  return `ТЕКСТ ДОГОВОРА ДЛЯ АУДИТА:\n${contractText}\n\n${ctx}\n\nВерни отчёт строго в формате JSON из системного промпта.`;
}

export function buildUserMessage(question: string, chunks: LawChunk[]): string {
  if (chunks.length === 0) {
    return `Вопрос пользователя:\n${question}\n\n(КОНТЕКСТ: фрагментов законов по вопросу не найдено — действует правило 2.)`;
  }
  const ctx = chunks
    .map((c, i) => {
      const source = c.source_url ? `; источник: ${c.source_url}` : "";
      return `[${i + 1}] ${c.code}, ${c.article} (ред. ${c.edition_date ?? "?"}${source}) : ${c.chunk}`;
    })
    .join("\n\n");
  return `КОНТЕКСТ (фрагменты действующих норм):\n${ctx}\n\nВопрос пользователя:\n${question}`;
}

// Грубая выборка «похоже на ссылку на норму»: ст. 12.37 КоАП, п. 60 Правил № 1764 и т.п.
const ARTICLE_RE =
  /(?:ст\.|статья|п\.|пункт|ч\.|часть)\s*\d[\d.]*/gi;

/**
 * Проверяет, есть ли упомянутые в ответе нормы среди выданных чанков.
 * Возвращает 'high' — все ссылки покрыты контекстом (или ссылок нет
 * и контекст был), 'low' — в ответе есть ссылки вне контекста либо
 * контекст пуст, а ссылки есть (возможная галлюцинация).
 */
export function checkCitations(answer: string, chunks: LawChunk[]): "high" | "low" {
  const mentions = answer.match(ARTICLE_RE) ?? [];
  if (mentions.length === 0) return "high";
  if (chunks.length === 0) return "low";
  const ctxText = chunks.map((c) => `${c.code} ${c.article}`.toLowerCase()).join(" | ");
  const uncovered = mentions.filter((m) => {
    const num = m.replace(/^(ст\.|статья|п\.|пункт|ч\.|часть)\s*/i, "").trim().toLowerCase();
    return num.length > 0 && !ctxText.includes(num);
  });
  return uncovered.length === 0 ? "high" : "low";
}
