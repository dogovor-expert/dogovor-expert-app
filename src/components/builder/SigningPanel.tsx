interface SigningPanelProps {
  signSheetEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function SigningPanel({ signSheetEnabled, onToggle }: SigningPanelProps) {
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
          Приложить лист подписания (протокол ПЭП) к PDF-файлу
        </span>
      </label>
      <p className="text-[10px] leading-relaxed text-gray-400">
        Простая электронная подпись (ст. 6, 9 закона № 63-ФЗ от
        06.04.2011) равнозначна собственноручной при соглашении
        сторон (п. 2 ст. 160 ГК РФ). В протокол войдут дата,
        стороны и контрольный хеш SHA-256 документа.
      </p>
    </div>
  );
}
