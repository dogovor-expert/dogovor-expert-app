// Сгенерировано scripts/generate-templates-meta.mts — НЕ редактировать вручную.
// Число шаблонов в LEGAL_TEMPLATES на момент генерации.
export const TEMPLATE_COUNT = 570;
export function templateWord(n: number = TEMPLATE_COUNT): string {
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 19) return "шаблонов";
  const last = n % 10;
  if (last === 1) return "шаблон";
  if (last >= 2 && last <= 4) return "шаблона";
  return "шаблонов";
}
