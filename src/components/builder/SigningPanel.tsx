import { getSigning, canShowSignSheet } from "@/data/signingMeta";
import type { SigningClass } from "@/data/types";

interface SigningPanelProps {
  templateId: string;
  signSheetEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

/**
 * Почему для этого документа лист ПЭП не прикладывается.
 * Раньше панель молча возвращала null → раздел выглядел пустым.
 */
const WHY_NOT: Record<Exclude<SigningClass, "E">, string> = {
  A: "Документ в простой письменной форме: стороны подписывают его собственноручно. Образец соглашения о ПЭП прикладывается к договорам между организациями и ИП, где стороны обмениваются электронными документами.",
  B: "Документ требует нотариальной формы (или нотариального удостоверения) — простая электронная подпись его не заменяет, поэтому лист ПЭП не прикладывается.",
  C: "Односторонний документ с одним подписантом: достаточно собственноручной подписи, соглашение о ПЭП не требуется.",
  D: "Документ подаётся в государственный орган по установленной форме: подписывается собственноручно, лист ПЭП не прикладывается.",
};

export default function SigningPanel({ templateId, signSheetEnabled, onToggle }: SigningPanelProps) {
  const signingClass = getSigning(templateId).signingClass;

  if (!canShowSignSheet(templateId)) {
    const reason = WHY_NOT[signingClass as Exclude<SigningClass, "E">];
    return (
      <div className="space-y-3">
        <p className="text-xs text-gray-600">
          Для этого документа лист-образец соглашения о ПЭП не формируется.
        </p>
        <p className="text-[10px] leading-relaxed text-gray-600">{reason}</p>
        <p className="text-[10px] leading-relaxed text-gray-600">
          Просто распечатайте готовый документ и подпишите его собственноручно —
          простая письменная форма не требует ни нотариуса, ни электронной подписи
          (ст. 161 ГК РФ).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          checked={signSheetEnabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="text-xs text-gray-600">
          Приложить образец соглашения об использовании ПЭП к PDF-файлу
        </span>
      </label>
      <p className="text-[10px] leading-relaxed text-gray-600">
        По ст. 6 (ч. 2) и ст. 9 закона № 63-ФЗ электронные документы,
        подписанные простой электронной подписью, равнозначны бумажным
        с собственноручной подписью только при наличии соглашения сторон.
        Приложение — образец такого соглашения: правила определения подписанта,
        обязанность хранить конфиденциальность ключа и отпечаток содержимого
        (SHA-256) для идентификации версии документа. Отпечаток сам по себе
        электронной подписью не является.
      </p>
    </div>
  );
}