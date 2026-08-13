"use client";
import { useState } from "react";
import { Check, X, Fingerprint } from "lucide-react";
import { isSnils, isOgrn, isOgrnip, isKpp, isBik, isBankAccount, luhn, isInn } from "@/lib/legal/validators";
import type { ValidateResult } from "@/lib/legal/validators";

type Tool = "snils" | "ogrn" | "inn" | "kpp" | "bik" | "account" | "card";

const TOOLS: { id: Tool; label: string; placeholder: string; needBik?: boolean }[] = [
  { id: "snils", label: "СНИЛС", placeholder: "000-000-000 00" },
  { id: "ogrn", label: "ОГРН", placeholder: "13 цифр" },
  { id: "inn", label: "ИНН", placeholder: "10 или 12 цифр" },
  { id: "kpp", label: "КПП", placeholder: "9 знаков" },
  { id: "bik", label: "БИК", placeholder: "9 цифр" },
  { id: "account", label: "Расчётный счёт", placeholder: "20 цифр", needBik: true },
  { id: "card", label: "Банковская карта", placeholder: "16 цифр" },
];

export default function Validators() {
  const [tool, setTool] = useState<Tool>("snils");
  const [value, setValue] = useState("");
  const [bik, setBik] = useState("");
  const [result, setResult] = useState<ValidateResult | null>(null);

  const check = () => {
    switch (tool) {
      case "snils": setResult(isSnils(value)); break;
      case "ogrn": setResult(isOgrn(value)); break;
      case "inn": setResult(isInn(value)); break;
      case "kpp": setResult(isKpp(value)); break;
      case "bik": setResult(isBik(value)); break;
      case "account": setResult(isBankAccount(value, bik)); break;
      case "card": setResult(luhn(value)); break;
    }
  };

  const current = TOOLS.find((t) => t.id === tool)!;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => { setTool(t.id); setResult(null); }}
            className={`py-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
              tool === t.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-500">{current.label}</label>
          <input type="text" value={value} onChange={(e) => { setValue(e.target.value); setResult(null); }}
            placeholder={current.placeholder}
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono" />
        </div>
        {current.needBik && (
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500">БИК банка</label>
            <input type="text" value={bik} onChange={(e) => setBik(e.target.value.replace(/\D/g, ""))}
              placeholder="044525225"
              className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono" />
          </div>
        )}
        <button onClick={check}
          className="w-full py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-xs transition cursor-pointer">
          Проверить
        </button>
      </div>

      {result && (
        <div className={`rounded-xl p-3 flex items-center gap-2.5 text-xs ${
          result.valid ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {result.valid ? <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <X className="w-4 h-4 text-red-500 flex-shrink-0" />}
          <span>{result.message}</span>
        </div>
      )}

      <p className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
        <Fingerprint className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        СНИЛС — контроль по весам 9..1 (mod 101); ОГРН — (12 цифр mod 11) mod 10; ОГРНИП — (14 цифр mod 13) mod 10; расчётный счёт — веса 7,1,3 (mod 10) с учётом БИК; карты — алгоритм Луна.
      </p>
    </div>
  );
}