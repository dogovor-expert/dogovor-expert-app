// 3.10 (аудит): интеграция «Сохранить результат» калькуляторов в /documents.
//
// Дизайн: результат сохраняется как обычная строка таблицы documents с
// синтетическим template_id вида `calc-<kind>-<base36>` — этого id нет в
// каталоге шаблонов, поэтому калькуляторные протоколы не попадают ни в
// /templates, ни в sitemap, ни в builder. Страница /documents распознаёт
// префикс `calc-` и показывает протокол в модалке (без «редактировать в
// конструкторе», без облачного экспорта).

export type CalcKind =
  | "vacation"
  | "alimony"
  | "customs"
  | "interest395"
  | "courtfee"
  | "daycounter"
  | "usn-npd"
  | "kasko";

export const CALC_KIND_LABEL: Record<CalcKind, string> = {
  vacation: "Расчёт отпускных",
  alimony: "Расчёт алиментов",
  customs: "Таможенный калькулятор",
  interest395: "Проценты по ст. 395 ГК РФ",
  courtfee: "Госпошлина в суд",
  daycounter: "Калькулятор дней (произв. календарь)",
  "usn-npd": "Налог УСН / НПД",
  kasko: "Оценка стоимости КАСКО",
};

/** Читаемый заголовок документа по префиксу template_id. */
export function calcKindFromTemplateId(templateId: string): CalcKind | null {
  if (!templateId.startsWith("calc-")) return null;
  for (const kind of Object.keys(CALC_KIND_LABEL) as CalcKind[]) {
    // Долгие префиксы раньше коротких: usn-npd может начинаться как "calc-usn-npd-…".
    if (templateId.startsWith(`calc-${kind}-`)) return kind;
  }
  return null;
}

export interface SavedCalcDoc {
  ok: true;
  id: string;
}
export interface SavedCalcError {
  ok: false;
  error: "unauthorized" | "too_many_requests" | "network" | "server";
}

/**
 * Сохраняет протокол расчёта как документ. Возвращает различимые ошибки,
 * чтобы UI подсказал «Войдите» vs «Слишком часто» vs честный сбой.
 */
export async function saveCalcResult(
  kind: CalcKind,
  title: string,
  lines: string[],
): Promise<SavedCalcDoc | SavedCalcError> {
  const protocol = lines.filter((l) => l.trim() !== "").join("\n").slice(0, 20000);
  if (!protocol) return { ok: false, error: "server" };
  const stamp = Date.now().toString(36);
  try {
    const r = await fetch("/api/documents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        template_id: `calc-${kind}-${stamp}`.slice(0, 100),
        title: title.slice(0, 200),
        fields: { protocol },
      }),
    });
    if (r.status === 401) return { ok: false, error: "unauthorized" };
    if (r.status === 429) return { ok: false, error: "too_many_requests" };
    if (!r.ok) return { ok: false, error: "server" };
    const j = (await r.json()) as { data?: { id?: string } };
    return { ok: true, id: j.data?.id ?? "" };
  } catch {
    return { ok: false, error: "network" };
  }
}

export const SAVE_CALC_ERRORS: Record<SavedCalcError["error"], string> = {
  unauthorized: "Войдите в аккаунт, чтобы сохранять расчёты в документы",
  too_many_requests: "Слишком много сохранений — попробуйте через минуту",
  network: "Нет связи с сервером",
  server: "Сервер не сохранил документ, попробуйте ещё раз",
};
