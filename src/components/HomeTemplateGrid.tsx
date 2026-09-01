"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Briefcase, Home, Car, Coins, Users, FileStack,
  ArrowRight, ChevronRight, ShieldCheck
} from "lucide-react";
import { TEMPLATE_META_LITE } from "@/data/templatesMetaLite";

const CATEGORY_DATA = [
  { id: "auto", label: "Авто", icon: Car, grad: "from-blue-500 to-indigo-600", badge: "bg-blue-50 text-blue-700" },
  { id: "realty", label: "Недвижимость", icon: Home, grad: "from-amber-500 to-orange-600", badge: "bg-amber-50 text-amber-700" },
  { id: "business", label: "Бизнес", icon: Briefcase, grad: "from-emerald-500 to-green-600", badge: "bg-emerald-50 text-emerald-700" },
  { id: "finance", label: "Финансы", icon: Coins, grad: "from-green-500 to-emerald-600", badge: "bg-green-50 text-green-700" },
  { id: "family", label: "Семейные", icon: Users, grad: "from-pink-500 to-rose-600", badge: "bg-pink-50 text-pink-700" },
  { id: "other", label: "Прочее", icon: FileStack, grad: "from-gray-500 to-slate-600", badge: "bg-gray-100 text-gray-600" },
];

const POPULAR = ["raspiska-money", "dkp-auto", "dkp-flat", "rental-flat", "contract-works", "loan-individuals", "power-attorney", "invoice"];

export default function HomeTemplateGrid() {
  const [cat, setCat] = useState("all");
  const grid = TEMPLATE_META_LITE.filter((t) =>
    cat === "all" ? POPULAR.includes(t.id) : POPULAR.includes(t.id) && t.category === cat
  );

  return (
    <section id="templates" className="mt-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-brand-600">Библиотека</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-1">Популярные документы</h2>
          </div>
          <Link href="/templates" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg px-3.5 py-2 transition-colors">
            Весь каталог
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setCat("all")} className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-colors ${cat === "all" ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"}`}>
            Все
          </button>
          {CATEGORY_DATA.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-colors ${cat === c.id ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"}`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {grid.map((t) => {
            const cd = CATEGORY_DATA.find((c) => c.id === t.category) || CATEGORY_DATA[5];
            const Icon = cd.icon;
            return (
              <Link
                key={t.id}
                href={`/builder?template=${t.id}`}
                className="group bg-white border border-gray-200 rounded-2xl p-5 card-hover hover:border-brand-300 hover:shadow-elevated transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cd.grad} flex items-center justify-center text-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cd.badge}`}>{cd.label}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-brand-700 transition-colors">{t.name}</h3>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed line-clamp-2">{t.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-600">{t.fieldCount} полей</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" />Проверен
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}