"use client";
import { Calculator, Shield } from "lucide-react";
import InzuroWidget from "@/components/osago/InzuroWidget";
import KbmFrame from "@/components/osago/KbmFrame";

export default function OsagoPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/40 ring-2 ring-brand-300/50">
          <Calculator className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ОСАГО и КБМ</h1>
          <p className="text-sm text-gray-500">
            Расчёт и оформление полиса у партнёра и проверка коэффициента бонус-малус по реестру РСА.
          </p>
        </div>
      </div>

      <div className="bg-white border border-brand-200 rounded-2xl overflow-hidden shadow-lg shadow-brand-500/10">
        <div className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-5">
          <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">ОСАГО онлайн — расчёт и оформление</h2>
            <p className="text-sm text-brand-50/90">
              Сравните предложения страховых компаний и оформите полис за пару минут.
            </p>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <InzuroWidget />
        </div>
      </div>

      <KbmFrame />
    </div>
  );
}
