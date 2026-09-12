"use client";
import { useState } from "react";
import SaveCalcButton from "@/components/calculator/SaveCalcButton";
import { Scale, Check } from "lucide-react";
import {
  courtFeeProperty,
  courtFeeNonProperty,
  courtFeeAppeal,
  courtFeeCassation,
  courtFeeAlimony,
} from "@/lib/legal/calc";

type Mode = "property" | "nonProperty" | "appeal" | "cassation" | "alimony" | "order";

export default function CourtFee() {
  const [claim, setClaim] = useState("");
  const [entity, setEntity] = useState(false);
  const [mode, setMode] = useState<Mode>("property");
  const [result, setResult] = useState<{ fee: number; formula: string; note?: string } | null>(null);

  const calc = () => {
    if (mode === "property" || mode === "order") {
      const v = parseFloat(claim);
      if (isNaN(v) || v <= 0) return;
      const r = courtFeeProperty(v, entity);
      const fee = mode === "order" ? Math.round(r.fee / 2) : r.fee;
      setResult({
        fee,
        formula: r.formula,
        note: mode === "order" ? "50% пошлины за иск — судебный приказ (пп. 2 п. 1 ст. 333.19 НК РФ)" : undefined,
      });
      return;
    }
    if (mode === "nonProperty") {
      const r = courtFeeNonProperty();
      const fee = entity ? r.org : r.child;
      setResult({ fee, formula: entity ? "20 000 ₽ (организация)" : "3 000 ₽ (физлицо)" });
      return;
    }
    if (mode === "appeal") {
      const r = courtFeeAppeal();
      const fee = entity ? r.org : r.child;
      setResult({ fee, formula: entity ? "15 000 ₽ (организация)" : "3 000 ₽ (физлицо)" });
      return;
    }
    if (mode === "cassation") {
      const r = courtFeeCassation();
      const fee = entity ? r.org : r.child;
      setResult({ fee, formula: entity ? "20 000 ₽ (организация)" : "5 000 ₽ (физлицо)" });
      return;
    }
    setResult({ fee: courtFeeAlimony(), formula: "150 ₽ — иск о взыскании алиментов (пп. 16 п. 1 ст. 333.19)" });
  };

  const templates: Record<string, string> = {
    property: "/builder?id=claim-generic",
    nonProperty: "/builder?id=claim-generic",
    appeal: "/builder?id=appeal-complaint",
    cassation: "/builder?id=appeal-complaint",
    alimony: "/builder?id=alimony-claim",
    order: "/builder?id=claim-generic",
  };

  const modes: { id: Mode; label: string }[] = [
    { id: "property", label: "Имущественный иск" },
    { id: "nonProperty", label: "Неимущественный иск" },
    { id: "appeal", label: "Апелляция" },
    { id: "cassation", label: "Кассация" },
    { id: "alimony", label: "Алименты" },
    { id: "order", label: "Судебный приказ" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setResult(null); }}
            className={`py-2 px-2 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
              mode === m.id
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-gray-200 text-gray-600 hover:border-brand-300 bg-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {(mode === "property" || mode === "order") && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-600">Цена иска (₽)</label>
              <input
                type="number"
                min="0"
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="Например 450000"
                className="w-full bg-gray-50 border border-gray-200 text-xs py-2.5 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={entity} onChange={(e) => setEntity(e.target.checked)} className="accent-brand-500" />
              Организация / ИП (повышенные ставки)
            </label>
          </>
        )}
        {mode === "nonProperty" && (
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={entity} onChange={(e) => setEntity(e.target.checked)} className="accent-brand-500" />
            Организация / ИП (20 000 ₽ вместо 3 000 ₽)
          </label>
        )}
        {(mode === "appeal" || mode === "cassation") && (
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={entity} onChange={(e) => setEntity(e.target.checked)} className="accent-brand-500" />
            Организация / ИП (повышенные ставки)
          </label>
        )}

        <button
          onClick={calc}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs transition cursor-pointer"
        >
          Рассчитать пошлину
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-mono text-gray-600">Госпошлина — ст. 333.19 НК РФ</span>
            </div>
            <SaveCalcButton
              kind="courtfee"
              title={`Госпошлина — ${result.fee.toLocaleString("ru-RU")} ₽`}
              lines={[
                `Тип иска: ${{ property: "имущественный (ст. 333.19 п.1)", nonProperty: "неимущественный", alimony: "о взыскании алиментов", order: "заявление о выдаче судебного приказа", appeal: "апелляционная жалоба", cassation: "кассационная жалоба" }[mode]}${entity ? " — юрлицо" : " — физлицо"}`,
                ...(mode === "property" ? [`Цена иска: ${Number(claim || 0).toLocaleString("ru-RU")} ₽`] : []),
                `Формула: ${result.formula}`,
                ...(result.note ? [`Примечание: ${result.note}`] : []),
                `Госпошлина к уплате: ${result.fee.toLocaleString("ru-RU")} ₽`,
                "",
                "Расчёт: dogovor.expert, ст. 333.19 НК РФ (ред. на 01.01.2026).",
              ]}
            />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {result.fee.toLocaleString("ru-RU")} ₽
          </p>
          <p className="text-[11px] text-gray-600">{result.formula}</p>
          {result.note && <p className="text-[11px] text-gray-600">{result.note}</p>}
          <a
            href={templates[mode]}
            className="inline-block mt-1 py-2 px-3 rounded-lg bg-white border border-brand-300 text-brand-600 font-bold text-[11px] hover:bg-brand-50 transition"
          >
            Составить иск / заявление →
          </a>
        </div>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed flex items-start gap-1.5">
        <Scale className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        Размеры пошлины — по пп. 1, 2, 3, 16, 19, 20, 21 п. 1 ст. 333.19 НК РФ (в ред. ФЗ от 12.07.2024 № 176-ФЗ). Точную сумму уточнит суд при принятии иска.
      </p>
    </div>
  );
}