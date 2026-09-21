"use client";
import { useState } from "react";
import { Check, Hash, X as XIcon } from "lucide-react";

/**
 * Валидатор ИНН (контрольная сумма). Выделен в отдельный компонент, чтобы
 * использовать и на хабе /utils (в UtilsTools), и на SEO-странице
 * /utils/proverka-inn (через CalculatorRunner) — единый источник разметки.
 */
export default function InnValidator() {
  const [inn, setInn] = useState("");
  const [innResult, setInnResult] = useState<null | { valid: boolean; type: string }>(null);

  const checkInn = () => {
    if (inn.length !== 10 && inn.length !== 12) {
      setInnResult({ valid: false, type: "Неверная длина" });
      return;
    }
    const n = inn.split("").map(Number);
    if (n.length === 10) {
      const checksum =
        (n[0] * 2 + n[1] * 4 + n[2] * 10 + n[3] * 3 + n[4] * 5 + n[5] * 9 + n[6] * 4 + n[7] * 6 + n[8] * 8) % 11 % 10;
      setInnResult({ valid: checksum === n[9], type: "Юридическое лицо" });
    } else {
      const s1 =
        (n[0] * 7 + n[1] * 2 + n[2] * 4 + n[3] * 10 + n[4] * 3 + n[5] * 5 + n[6] * 9 + n[7] * 4 + n[8] * 6 + n[9] * 8) % 11 % 10;
      const s2 =
        (n[0] * 3 + n[1] * 7 + n[2] * 2 + n[3] * 4 + n[4] * 10 + n[5] * 3 + n[6] * 5 + n[7] * 9 + n[8] * 4 + n[9] * 6 + n[10] * 8) % 11 % 10;
      setInnResult({ valid: s1 === n[10] && s2 === n[11], type: "ИП / Физлицо" });
    }
  };

  return (
    <div>
      <h3 className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
        <Hash className="w-4 h-4 text-brand-500" /> Валидатор ИНН
      </h3>
      <p className="mt-1 text-[11.5px] text-gray-500">
        Проверка контрольной суммы для ИНН юрлица (10 цифр) и ИП / физлица (12 цифр).
      </p>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="10 или 12 цифр"
          value={inn}
          maxLength={12}
          onChange={(e) => { setInn(e.target.value.replace(/\D/g, "")); setInnResult(null); }}
          className="flex-1 bg-gray-50 border border-gray-200 text-sm py-2.5 px-3 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
        />
        <button
          onClick={checkInn}
          className="px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-bold text-xs transition cursor-pointer"
        >
          Проверить
        </button>
      </div>
      {innResult && (
        <div
          className={`mt-4 rounded-xl p-3 flex items-center gap-2.5 text-xs ${
            innResult.valid
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {innResult.valid ? <Check className="w-4 h-4 text-emerald-500" /> : <XIcon className="w-4 h-4 text-red-500" />}
          <span>{innResult.valid ? `ИНН корректен (${innResult.type})` : `ИНН некорректен — ${innResult.type}`}</span>
        </div>
      )}
    </div>
  );
}
