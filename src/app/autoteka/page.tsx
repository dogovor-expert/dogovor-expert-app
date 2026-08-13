"use client";
import { useState } from "react";
import { Activity, Search, AlertTriangle, Check, Loader2, Car, FileText, Shield } from "lucide-react";

export default function AutotekaPage() {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    brand: string; year: number; status: string; theft: string; pledges: number; accidents: number;
  }>(null);

  const handleCheck = () => {
    if (vin.length < 17) return;
    setLoading(true);
    setTimeout(() => {
      setResult({
        brand: "Hyundai Solaris", year: 2020, status: "Снята с учета", theft: "Не числится",
        pledges: 0, accidents: 2,
      });
      setLoading(false);
    }, 1800);
  };

  const dispatchAutofill = () => {
    if (!result) return;
    window.dispatchEvent(new CustomEvent("autofill", { detail: { brand: result.brand, vin, year: result.year } }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Автотека — проверка истории автомобиля</h1>
          <p className="text-sm text-gray-500">VIN, ДТП, залоги, розыск</p>
        </div>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1">Демо-режим</span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-[11px] text-amber-800 leading-relaxed">
        Это демонстрационный интерфейс: данные генерируются случайно. Для реальной проверки истории автомобиля воспользуйтесь Автотекой, ГИБДД или Пробизи.
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <label className="text-xs font-bold text-gray-700 uppercase">Введите VIN номер</label>
        <div className="flex gap-3">
          <input
            type="text" placeholder="17 символов VIN" value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            maxLength={17}
            className="flex-1 bg-gray-50 border border-gray-200 text-sm py-3 px-4 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono tracking-wider"
          />
          <button
            onClick={handleCheck}
            disabled={vin.length < 17 || loading}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-bold text-sm transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Проверить
          </button>
        </div>
        <p className="text-[10px] text-gray-400 font-mono">VIN должен содержать ровно 17 символов</p>
      </div>

      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <Car className="h-8 w-8 text-indigo-500" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">{result.brand}, {result.year}</h3>
              <p className="text-xs text-gray-500">VIN: {vin}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Статус учета", value: result.status, color: "text-emerald-600" },
              { label: "Розыск", value: result.theft, color: result.theft.includes("Не") ? "text-emerald-600" : "text-red-600" },
              { label: "ДТП", value: `${result.accidents}`, color: result.accidents > 0 ? "text-amber-600" : "text-emerald-600" },
              { label: "Залоги", value: `${result.pledges}`, color: result.pledges > 0 ? "text-red-600" : "text-emerald-600" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <p className="text-[10px] text-gray-500 uppercase font-mono">{item.label}</p>
                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
          <button
            onClick={dispatchAutofill}
            className="w-full py-3 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4" /> Перенести данные в договор ДКП
          </button>
        </div>
      )}

      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center">
        <p className="text-xs text-indigo-600">
          <Shield className="h-3.5 w-3.5 inline mr-1" />
          Данные предоставлены в справочных целях на основании публичных API
        </p>
      </div>
    </div>
  );
}
