"use client";

/**
 * Экспорт диалога AI-юриста в фирменный PDF/DOCX.
 *
 * Тяжёлые библиотеки (pdf-lib, docx, file-saver) подгружаются ЛЕНИВО только
 * при клике — чтобы не раздувать стартовый бандл страницы /ai-yurist.
 * Разметка строится из h1/h2/p/ul — их понимают оба парсера (pdf и docx).
 */

export interface ExportSource {
  code: string;
  article: string;
  edition_date: string | null;
  source_url?: string | null;
  locator?: string | null;
}

export interface ExportMessage {
  role: "user" | "assistant" | "system";
  content: string;
  sources?: ExportSource[];
  confidence?: "high" | "low";
}

const DISCLAIMER =
  "Информация общего характера, не является юридической консультацией. " +
  "Нормы приведены по действующим редакциям из официального источника (pravo.gov.ru).";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Текст → абзацы (пустая строка = новый абзац, одиночный \n = перенос). */
function paragraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => `<p>${esc(b).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function sourcesHtml(sources?: ExportSource[]): string {
  if (!sources || sources.length === 0) return "";
  const items = sources
    .map((s) => {
      const loc = s.locator ? ` (${esc(s.locator)})` : "";
      const link = s.source_url ? ` — ${esc(s.source_url)}` : "";
      return `<li><strong>${esc(s.code)}, ${esc(s.article)}</strong>${loc} — ред. ${esc(
        s.edition_date ?? "—"
      )}${link}</li>`;
    })
    .join("");
  return `<h2 class="text-lg">Источники (проверено по базе)</h2><ul>${items}</ul>`;
}

export function buildChatHtml(
  messages: ExportMessage[],
  opts: { title?: string; date?: string } = {}
): string {
  const title = opts.title ?? "Ответ AI-юриста";
  const parts: string[] = [`<h1 class="text-2xl">${esc(title)}</h1>`];
  parts.push(`<p>Dogovor.expert · консультация от ${esc(opts.date ?? "")}</p>`);
  for (const m of messages) {
    if (m.role === "user") {
      parts.push(`<h2 class="text-lg">Вопрос</h2>${paragraphs(m.content)}`);
    } else if (m.role === "assistant") {
      parts.push(`<h2 class="text-lg">Ответ</h2>${paragraphs(m.content)}`);
      parts.push(sourcesHtml(m.sources));
    }
  }
  parts.push(`<p>${esc(DISCLAIMER)}</p>`);
  // ОБЯЗАТЕЛЬНО один корневой элемент: exportPdf берёт body.firstElementChild.
  return `<div>${parts.join("")}</div>`;
}

export function chatExportFilename(kind: "chat" | "message", date: string): string {
  const base = kind === "chat" ? "Диалог_AI-юриста" : "Ответ_AI-юриста";
  return `${base}_${date}`;
}

export async function downloadChatPdf(html: string, filename: string): Promise<void> {
  const [{ buildPdf }, { loadSaveAs }] = await Promise.all([
    import("@/lib/exportPdf"),
    import("@/lib/download"),
  ]);
  const { blob } = await buildPdf(html, {
    design: "brand",
    pageNumbers: true,
    branding: true,
  });
  const saveAs = await loadSaveAs();
  saveAs(blob, `${filename}.pdf`);
}

export async function downloadChatDocx(html: string, filename: string): Promise<void> {
  const { exportToDocxLazy } = await import("@/lib/exportDocxLazy");
  await exportToDocxLazy(html, filename, { design: "brand" });
}
