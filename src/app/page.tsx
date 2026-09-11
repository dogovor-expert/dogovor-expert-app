import Link from "next/link";
import type { Metadata } from "next";
import {
  Shield, FileText, Camera, Car,
  ArrowRight, Sparkles, FileCheck,
  FileLock, ShieldCheck, Download
} from "lucide-react";
import HomeTemplateGrid from "@/components/HomeTemplateGrid";
import { TEMPLATE_META_LITE } from "@/data/templatesMetaLite";

export const revalidate = 3600;
export const dynamic = "force-static"; // P0: явно включаем SSG, иначе Next 15 обходит ISR (см. INVARIANTS.md).

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 to-white pb-10">
      {/* ======================= HERO ======================= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(420px_220px_at_12%_8%,rgba(37,99,235,0.08),transparent_60%),radial-gradient(420px_240px_at_88%_20%,rgba(124,58,237,0.08),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-12 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-brand-700 bg-white border border-brand-200 rounded-full px-3.5 py-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {TEMPLATE_META_LITE.length} шаблонов · бесплатно и без ограничений
            </span>
            <h1 className="mt-5 text-display-xl font-extrabold tracking-tight text-gray-900">
              Документы, которые{" "}
              <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                готовы к подписи
              </span>
            </h1>
            <p className="mt-4 text-base text-gray-600 leading-relaxed max-w-lg">
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
            <p className="mt-4 text-xs text-gray-600">
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
                <p className="text-[10px] text-gray-600 mt-0.5 font-semibold tracking-wider uppercase">Стороны</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-xs text-gray-600">Заимодавец</span>
                    <b className="text-xs font-semibold text-gray-900">Иванов И. И.</b>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-xs text-gray-600">Заёмщик</span>
                    <b className="text-xs font-semibold text-gray-900">Петров П. П.</b>
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 mt-4 font-semibold tracking-wider uppercase">Сумма и срок</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-xs text-gray-600">Сумма</span>
                    <b className="text-xs font-semibold text-gray-900">500 000 ₽</b>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-xs text-gray-600">Проценты</span>
                    <b className="text-xs font-semibold text-emerald-600">без процентов ✓</b>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-1.5">
                  {["Поля заполнены", "Готов к печати", "Проверен юристом", "Экспорт PDF"].map((c) => (
                    <div key={c} className="flex items-center gap-1.5 text-[11px] text-gray-600">
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
            {[[String(TEMPLATE_META_LITE.length), "шаблонов документов"], ["100%", "бесплатно"], ["< 5 мин", "до готового файла"], ["152-ФЗ", "данные в браузере"]].map(([n, l]) => (
              <div key={l}>
                <div className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">{n}</div>
                <div className="text-[11px] text-gray-600 font-semibold uppercase tracking-widest mt-1">{l}</div>
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
          <p className="mt-2 text-gray-600 text-sm">Никакой магии: выбираете документ, отвечаете на вопросы, скачиваете готовый файл.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { n: "1", icon: FileText, t: "Выберите шаблон", d: `Библиотека из ${TEMPLATE_META_LITE.length} готовых форм — от расписки до договора подряда, с актуальными формулировками.` },
            { n: "2", icon: Camera, t: "Заполните поля", d: "ФИО, суммы и реквизиты подскажут. Можно сфотографировать паспорт — он распознается." },
            { n: "3", icon: Download, t: "Скачайте и подпишите", d: "PDF, Word или печать. Правовой аудит проверит обязательные поля и форматы." },
          ].map((s) => (
            <div key={s.n} className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-soft card-hover">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white font-bold flex items-center justify-center">{s.n}</div>
                <s.icon className="w-6 h-6 text-brand-100" />
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900">{s.t}</h3>
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= TEMPLATES ======================= */}
      <HomeTemplateGrid />

      {/* ======================= SCANNER ======================= */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="grid lg:grid-cols-2 gap-8 bg-white border border-gray-100 rounded-3xl shadow-soft overflow-hidden">
          <div className="p-10">
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-brand-600">Сканер документов</span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Фотографируете —<br />заполняется само
            </h2>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
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
                  <span className="block text-[11px] text-gray-600 truncate">{r.d}</span>
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
            { icon: FileLock, t: "Данные под контролем", d: "Документы и черновики хранятся в вашем браузере. Точный серверный OCR и облачная синхронизация включаются только по вашему явному согласию." },
            { icon: Shield, t: "Соответствие 152-ФЗ", d: "Данные документов обрабатываются локально; серверное распознавание и партнёрские сервисы работают только после отдельного согласия (см. Политику)." },
            { icon: FileCheck, t: "Правовая проверка встроена", d: "Каждый шаблон содержит чек-лист соответствия требованиям закона и проверку обязательных полей перед печатью." },
          ].map((q) => (
            <div key={q.t} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white flex items-center justify-center mb-3`}>
                <q.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">{q.t}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{q.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= CTA ======================= */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-700 to-purple-700 rounded-3xl py-14 px-8 text-center text-white shadow-card">
          <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-white/10" />
          <h2 className="text-display-lg font-extrabold tracking-tight">Начните бесплатно</h2>
          <p className="mt-3 text-blue-100 max-w-lg mx-auto text-sm leading-relaxed">
            Никаких карт и подписок. Выберите документ и скачайте его готовым — прямо сейчас.
          </p>
          <Link href="/builder" className="mt-7 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-brand-700 bg-white hover:bg-gray-50 rounded-xl transition-colors">
            Создать первый документ
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs text-blue-200">152-ФЗ · данные документов — в вашем браузере; точный OCR — по согласию</p>
        </div>
      </section>

      {/* ======================= FOOTER ======================= */}
      <footer className="max-w-7xl mx-auto px-6 pt-16">
        <div className="border-t border-gray-200 pt-8 pb-6 flex flex-wrap justify-between gap-6 text-xs text-gray-600">
          <span>© 2026 «Dogovor.expert». Не является юридической консультацией.</span>
          <div className="flex items-center gap-2 text-gray-600">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            152-ФЗ · данные защищены
          </div>
        </div>
      </footer>
    </div>
  );
}