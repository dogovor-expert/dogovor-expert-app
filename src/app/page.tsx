"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Shield, FileText, Camera, Star,
  ArrowRight, Sparkles, FileCheck,
  ChevronRight, Briefcase, Home, Car, Coins,
  Users, FileStack, FileLock, ShieldCheck, Download
} from "lucide-react";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";

const CATEGORY_DATA = [
  { id: "auto", label: "Авто", icon: Car, grad: "from-blue-500 to-indigo-600", badge: "bg-blue-50 text-blue-700" },
  { id: "realty", label: "Недвижимость", icon: Home, grad: "from-amber-500 to-orange-600", badge: "bg-amber-50 text-amber-700" },
  { id: "business", label: "Бизнес", icon: Briefcase, grad: "from-emerald-500 to-green-600", badge: "bg-emerald-50 text-emerald-700" },
  { id: "finance", label: "Финансы", icon: Coins, grad: "from-green-500 to-emerald-600", badge: "bg-green-50 text-green-700" },
  { id: "family", label: "Семейные", icon: Users, grad: "from-pink-500 to-rose-600", badge: "bg-pink-50 text-pink-700" },
  { id: "other", label: "Прочее", icon: FileStack, grad: "from-gray-500 to-slate-600", badge: "bg-gray-100 text-gray-600" },
];

const POPULAR = ["raspiska-money", "dkp-auto", "dkp-flat", "arenda-flat", "dogovor-podryad", "zaem", "doverennost", "invoice"];

export default function HomePage() {
  const [cat, setCat] = useState("all");

  const grid = LEGAL_TEMPLATES.filter((t) =>
    cat === "all" ? POPULAR.includes(t.id) : POPULAR.includes(t.id) && t.category === cat
  );

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 to-white pb-10">
      {/* ======================= HERO ======================= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(420px_220px_at_12%_8%,rgba(37,99,235,0.08),transparent_60%),radial-gradient(420px_240px_at_88%_20%,rgba(124,58,237,0.08),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-12 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-brand-700 bg-white border border-brand-200 rounded-full px-3.5 py-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {LEGAL_TEMPLATES.length} шаблонов · бесплатно и без ограничений
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Документы, которые{" "}
              <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                готовы к подписи
              </span>
            </h1>
            <p className="mt-4 text-base text-gray-500 leading-relaxed max-w-lg">
              Заполните простые поля — и получите готовый договор, расписку или заявление. Юридическая проверка и печать включены в каждый шаблон.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/builder" className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors">
                Создать бесплатно
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#templates" className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-brand-300 hover:text-brand-700 rounded-xl transition-colors">
                Смотреть шаблоны
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Без карты · без подписок · данные остаются в вашем браузере
            </p>
          </div>

          {/* Document card visual */}
          <div className="relative hidden lg:flex justify-center">
            <div className="relative w-[360px] -rotate-1">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                ДОГОВОР № 101
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 pt-7">
                <h4 className="text-sm font-bold text-gray-900">Расписка в получении денег</h4>
                <p className="text-[10px] text-gray-400 mt-0.5 font-semibold tracking-wider uppercase">Стороны</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-xs text-gray-500">Заимодавец</span>
                    <b className="text-xs font-semibold text-gray-900">Иванов И. И.</b>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-xs text-gray-500">Заёмщик</span>
                    <b className="text-xs font-semibold text-gray-900">Петров П. П.</b>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-4 font-semibold tracking-wider uppercase">Сумма и срок</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-xs text-gray-500">Сумма</span>
                    <b className="text-xs font-semibold text-gray-900">500 000 ₽</b>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-xs text-gray-500">Проценты</span>
                    <b className="text-xs font-semibold text-emerald-600">без процентов ✓</b>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-1.5">
                  {["Поля заполнены", "Готов к печати", "Проверен юристом", "Экспорт PDF"].map((c) => (
                    <div key={c} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <span className="w-3.5 h-3.5 rounded bg-emerald-500 text-white flex items-center justify-center">
                        <FileCheck className="w-2.5 h-2.5" />
                      </span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -right-4 top-16 rotate-[14deg] w-20 h-20 rounded-full border-2 border-emerald-500 text-emerald-600 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center text-center leading-tight bg-emerald-50/80">
                готово
                <br />к печати
              </div>
              <div className="absolute -left-8 top-8 animate-float bg-white border border-gray-200 shadow-soft rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Экспорт в PDF и Word
              </div>
            </div>
          </div>
        </div>

        {/* stats strip */}
        <div className="relative max-w-7xl mx-auto px-6 pb-2">
          <div className="border-y border-gray-200 bg-white/70 rounded-2xl shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 px-8 py-6">
            {[[String(LEGAL_TEMPLATES.length), "шаблонов документов"], ["100%", "бесплатно"], ["< 5 мин", "до готового файла"], ["152-ФЗ", "данные только в браузере"]].map(([n, l]) => (
              <div key={l}>
                <div className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">{n}</div>
                <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= HOW IT WORKS ======================= */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-brand-600 mb-2">Как это работает</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Три шага до подписанного договора</h2>
          <p className="mt-2 text-gray-500 text-sm">Никакой магии: выбираете документ, отвечаете на вопросы, скачиваете готовый файл.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { n: "1", icon: FileText, t: "Выберите шаблон", d: `Библиотека из ${LEGAL_TEMPLATES.length} готовых форм — от расписки до договора подряда, с актуальными формулировками.` },
            { n: "2", icon: Camera, t: "Заполните поля", d: "ФИО, суммы и реквизиты подскажут. Можно сфотографировать паспорт — он распознается." },
            { n: "3", icon: Download, t: "Скачайте и подпишите", d: "PDF, Word или печать. Правовой аудит проверит обязательные поля и форматы." },
          ].map((s) => (
            <div key={s.n} className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-soft card-hover">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white font-bold flex items-center justify-center">{s.n}</div>
                <s.icon className="w-6 h-6 text-brand-100" />
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900">{s.t}</h3>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= TEMPLATES ======================= */}
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
            <button onClick={() => setCat("all")} className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-colors ${cat === "all" ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-500 border-gray-200 hover:border-brand-300"}`}>
              Все
            </button>
            {CATEGORY_DATA.map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)} className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-colors ${cat === c.id ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-500 border-gray-200 hover:border-brand-300"}`}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {grid.map((t) => {
              const cd = CATEGORY_DATA.find((c) => c.id === t.category) || CATEGORY_DATA[5];
              return (
                <Link
                  key={t.id}
                  href={`/builder?template=${t.id}`}
                  className="group bg-white border border-gray-200 rounded-2xl p-5 card-hover hover:border-brand-300 hover:shadow-elevated transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cd.grad} flex items-center justify-center text-white shadow-sm`}>
                      <cd.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cd.badge}`}>{cd.label}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-brand-700 transition-colors">{t.name}</h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">{t.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">{t.fields.length} полей</span>
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

      {/* ======================= SCANNER ======================= */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="grid lg:grid-cols-2 gap-8 bg-white border border-gray-100 rounded-3xl shadow-soft overflow-hidden">
          <div className="p-10">
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-brand-600">Сканер документов</span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Фотографируете —<br />заполняется само
            </h2>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed">
              Распознаём паспорт, ПТС и СТС прямо в браузере. Данные подставляются в форму автоматически, вы только проверяете.
            </p>
            <ul className="mt-6 space-y-3">
              {([
                ["Паспорт РФ — ФИО, серия, номер, адрес", Camera],
                ["ПТС/СТС — VIN, номер, марка", Car],
                ["Обработка только на вашем устройстве", Shield],
                ["Работает без интернета", FileLock],
              ] as [string, typeof Camera][]).map(([text, Icon]) => (
                <li key={text} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileCheck className="w-3.5 h-3.5" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <Link href="/builder" className="mt-7 inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors">
              Попробовать
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-slate-50 border-l border-gray-100 p-8 flex flex-col justify-center gap-3">
            {[
              { g: "from-brand-500 to-indigo-600", icon: FileText, t: "Паспорт РФ", d: "Распознано: ФИО, серия, адрес" },
              { g: "from-orange-500 to-red-600", icon: Car, t: "ПТС / СТС", d: "VIN и госномер найдены" },
              { g: "from-purple-500 to-indigo-600", icon: Download, t: "Договор заполнен", d: "Готов к скачиванию за 2 минуты" },
            ].map((r) => (
              <div key={r.d} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${r.g} flex items-center justify-center text-white`}>
                  <r.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <b className="block text-xs font-semibold text-gray-900 truncate">{r.t}</b>
                  <span className="block text-[11px] text-gray-500 truncate">{r.d}</span>
                </div>
                <FileCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= TRUST ======================= */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-brand-600">Безопасность</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-1">Почему нам доверяют</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: FileLock, t: "Данные не покидают устройство", d: "Все документы и черновики хранятся в вашем браузере. Никакого сервера — нечего утечь." },
            { icon: Shield, t: "Соответствие 152-ФЗ", d: "Данные ваших документов обрабатываются локально; партнёрские сервисы работают только с вашего согласия." },
            { icon: FileCheck, t: "Правовая проверка встроена", d: "Каждый шаблон содержит чек-лист соответствия требованиям закона и проверку обязательных полей перед печатью." },
          ].map((q) => (
            <div key={q.t} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white flex items-center justify-center mb-3`}>
                <q.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">{q.t}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{q.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= CTA ======================= */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-700 to-purple-700 rounded-3xl py-14 px-8 text-center text-white shadow-card">
          <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-white/10" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Начните бесплатно</h2>
          <p className="mt-3 text-blue-100 max-w-lg mx-auto text-sm leading-relaxed">
            Никаких карт и подписок. Выберите документ и скачайте его готовым — прямо сейчас.
          </p>
          <Link href="/builder" className="mt-7 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-brand-700 bg-white hover:bg-gray-50 rounded-xl transition-colors">
            Создать первый документ
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs text-blue-200">152-ФЗ · данные документов — только в вашем браузере</p>
        </div>
      </section>

      {/* ======================= FOOTER ======================= */}
      <footer className="max-w-7xl mx-auto px-6 pt-16">
        <div className="border-t border-gray-200 pt-8 pb-6 flex flex-wrap justify-between gap-6 text-xs text-gray-400">
          <span>© 2026 «Dogovor.expert». Не является юридической консультацией.</span>
          <div className="flex items-center gap-2 text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            152-ФЗ · данные защищены
          </div>
        </div>
      </footer>
    </div>
  );
}