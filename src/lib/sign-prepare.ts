/**
 * Подготовка документа к подписанию (server-side).
 *
 * ВАЖНО, почему так: шаблоны живут в СТАТИЧЕСКОМ каталоге
 * (`src/data/templates/*`), а текст документа — в `src/data/templatePreviews.ts`.
 * Таблицы `templates` в базе НЕТ и никогда не было, а у таблицы `documents`
 * нет колонок `html`/`data` (значения лежат в `fields` jsonb). Ранняя версия
 * `/api/sign/prepare` читала и то, и другое — из-за этого всегда падала.
 *
 * Здесь единственный правильный способ собрать HTML документа для подписи:
 * те же функции, что использует конструктор и предпросмотр, чтобы
 * подписывался ровно тот документ, который пользователь видел.
 */
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";
import { TEMPLATE_PREVIEWS } from "@/data/templatePreviews";
import { buildPackValues, renderTemplateDocument } from "@/lib/renderDocument";
import type { LegalTemplate } from "@/data/types";

/**
 * Резерв под CMS для ПРОБНОГО прохода. Реальная длина подписи неизвестна до
 * момента подписания (зависит от цепочки сертификатов и метки времени), поэтому
 * клиент сначала подписывает пробный контент, измеряет длину CMS и только затем
 * запрашивает плейсхолдер точной длины.
 */
export const SIGN_PROBE_RESERVE = 8192;

/** Верхняя граница резерва (hex-символы). 65536 hex = 32 КБ DER. */
export const SIGN_MAX_RESERVE = 65536;

/** Минимальный осмысленный резерв под CMS. */
export const SIGN_MIN_RESERVE = 512;

export interface SignableDocument {
  template: LegalTemplate;
  /** Текст документа (Mustache), по которому собирается HTML. */
  previewTemplate: string;
  /** Итоговый HTML документа. */
  html: string;
}

/**
 * Приводит значения документа (`documents.fields`, jsonb) к строкам.
 * В базе могут лежать boolean/number (чекбоксы, числа) и массивы (repeating) —
 * в форму рендера берём только скалярные значения.
 */
export function normalizeSignFields(fields: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return out;
  for (const [key, value] of Object.entries(fields as Record<string, unknown>)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string") {
      out[key] = value;
      continue;
    }
    if (typeof value === "boolean" || typeof value === "number") {
      out[key] = String(value);
    }
  }
  return out;
}

/** Текст документа: templatePreviews — первичный источник, inline — фолбэк. */
export function previewForTemplate(template: LegalTemplate): string {
  return TEMPLATE_PREVIEWS[template.id] ?? template.previewTemplate ?? "";
}

/** Находит шаблон в статическом каталоге (в базе шаблонов нет). */
export function resolveSignTemplate(templateId: string): LegalTemplate | null {
  return LEGAL_TEMPLATES.find((t) => t.id === templateId) ?? null;
}

/**
 * Собирает HTML документа для подписания тем же движком, что конструктор и
 * предпросмотр. Возвращает null, если шаблон не найден или у него нет текста:
 * подписывать пустой документ нельзя ни при каких условиях.
 */
export function buildSignableDocument(
  templateId: string,
  fields: unknown
): SignableDocument | null {
  const template = resolveSignTemplate(templateId);
  if (!template) return null;
  const previewTemplate = previewForTemplate(template);
  if (!previewTemplate.trim()) return null;
  const values = buildPackValues(template, normalizeSignFields(fields));
  const html = renderTemplateDocument(template, values, { previewTemplate });
  if (!html.trim()) return null;
  return { template, previewTemplate, html };
}

/**
 * Проверяет присланный клиентом резерв под CMS.
 * undefined/null → пробный резерв; недопустимое значение → null (400).
 */
export function normalizeReserve(value: unknown): number | null {
  if (value === undefined || value === null) return SIGN_PROBE_RESERVE;
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < SIGN_MIN_RESERVE || value > SIGN_MAX_RESERVE) return null;
  return value;
}
