import type { LegalTemplate } from "@/data/types";
import { isFieldVisible } from "@/lib/validation";
import { resolveFieldLabel } from "@/lib/roleLabels";

export interface IncompleteField {
  id: string;
  label: string;
}

/**
 * Обязательные видимые незаполненные поля — для навигации
 * «следующее поле» и перехода к ошибкам. Порядок = порядок полей
 * в шаблоне (сверху вниз). Лейблы — через resolveFieldLabel,
 * как в самой форме.
 */
export function incompleteRequiredFields(
  template: LegalTemplate,
  values: Record<string, string>
): IncompleteField[] {
  return template.fields
    .filter(
      (f) =>
        f.validation?.required &&
        isFieldVisible(f, values) &&
        !values[f.id]?.trim()
    )
    .map((f) => ({ id: f.id, label: resolveFieldLabel(template.id, f) }));
}
