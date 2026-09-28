"use client";
import { useState } from "react";
import { Copy, Hash } from "lucide-react";
import { rublesInWords } from "@/lib/legal/numberWords";

export default function SumWords() {
  const [sum, setSum] = useState("150000");
  const [words, setWords] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const convert = () => {
    const v = parseFloat(sum);
    if (isNaN(v) || v < 0 || v > 999_999_999_999_999) {
      setWords("Введите корректную сумму (до 999 трлн ₽)");
      return;
    }
    setWords(rublesInWords(v));
    setCopied(false);
  };

  const copy = () => {
    if (!words) return;
    void navigator.clipboard?.writeText(words);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="sumwords-sum" className="text-[10px] font-mono text-gray-600">Сумма (₽)</label>
          <input id="sumwords-sum" type="number" min="0" step="0.01" value={sum} onChange={(e) => setSum(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
        </div>
        <button onClick={convert}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer">
          Прописью
        </button>
      </div>

      {words && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-800 leading-relaxed">{words}</p>
          <button onClick={copy}
            className="mt-3 inline-flex items-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition cursor-pointer">
            <Copy className="w-3.5 h-3.5" /> {copied ? "Скопировано" : "Скопировать"}
          </button>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Hash className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Сумма прописью оформляется в договорах, расписках, доверенностях и претензиях — так защищаются от подмены цифр. Форма: «X рублей YY копеек» с правильными склонениями.
      </p>
    </div>
  );
}