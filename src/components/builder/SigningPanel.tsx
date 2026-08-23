interface SigningPanelProps {
  /** Панель показывается только для шаблонов класса E (ЭДО допустим). */
  visible: boolean;
  signSheetEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function SigningPanel({ visible, signSheetEnabled, onToggle }: SigningPanelProps) {
  if (!visible) return null;
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
