import Link from "next/link";
import type { Metadata } from "next";
import {
  Shield, FileText, Camera, Car, Coins, Home as HomeIcon, Briefcase, Users, FileStack,
  ArrowRight, Sparkles, FileCheck, FileLock, ShieldCheck, Download, ChevronRight,
  Clock, Lock, Star, HelpCircle, ScanLine, BadgeCheck,
} from "lucide-react";
import HomeTemplateGrid from "@/components/HomeTemplateGrid";
import MarketWeatherStrip from "@/components/home/MarketWeatherStrip";
import { TEMPLATE_META_LITE } from "@/data/templatesMetaLite";

export const revalidate = 3600;
export const dynamic = "force-static"; // P0: явно включаем SSG, иначе Next 15 обходит ISR (см. INVARIANTS.md).

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const TOTAL = TEMPLATE_META_LITE.length;

const CATEGORY_ICON: Record<string, { icon: typeof Car; grad: string }> = {
  auto: { icon: Car, grad: "from-blue-500 to-indigo-600" },
  realty: { icon: HomeIcon, grad: "from-amber-500 to-orange-600" },
  business: { icon: Briefcase, grad: "from-emerald-500 to-green-600" },
  finance: { icon: Coins, grad: "from-green-500 to-emerald-600" },
  family: { icon: Users, grad: "from-pink-500 to-rose-600" },
  other: { icon: FileStack, grad: "from-gray-500 to-slate-600" },
};

const POPULAR_IDS = [
  "raspiska-money",
  "dkp-auto",
  "rental-flat",
  "contract-works",
  "loan-individuals",
  "power-attorney",
  "invoice",
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Это действительно бесплатно?",
    a: "Да. Все шаблоны доступны без оплаты, регистрации и подписки. Скачивание PDF и Word не ограничено — мы не берём деньги за базовые документы.",
  },
  {
    q: "Нужно ли регистрироваться?",
    a: "Нет. Можно заполнить и скачать документ без аккаунта. Регистрация нужна только если вы хотите сохранять черновики и историю документов между устройствами.",
  },
  {
    q: "Куда попадают мои данные?",
    a: "Данные документов обрабатываются прямо в браузере и не отправляются на сервер. Серверные функции (точный OCR, синхронизация) включаются только с вашего отдельного согласия — в соответствии с 152-ФЗ.",
  },
  {
    q: "Документы имеют юридическую силу?",
    a: "Шаблоны составлены по актуальным формулировкам ГК РФ и проверены практикующим юристом. Готовый документ можно подписывать и использовать. Для сложных сделок рекомендуем консультацию юриста.",
  },
  {
    q: "В каком формате я получу документ?",
    a: "На выбор: PDF для печати и подписи или DOCX для дальнейшего редактирования в Word. Также доступна отправка на печать прямо из браузера.",
  },
  {
    q: "Можно ли заполнить документ с телефона?",
    a: "Да, сервис полностью адаптивен. Можно сфотографировать паспорт или ПТС — сканер распознает данные и подставит их в поля автоматически.",
  },
];

function popularTemplates() {
  return POPULAR_IDS.map((id) => TEMPLATE_META_LITE.find((t) => t.id === id)).filter(
    (t): t is (typeof TEMPLATE_META_LITE)[number] => Boolean(t)
  );
}

export default function HomePage() {
  const popular = popularTemplates();

  return (
    <div className="min-h-full pb-10">
      {/* ======================= HERO ======================= */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_260px_at_10%_0%,rgba(37,99,235,0.10),transparent_60%),radial-gradient(460px_280px_at_92%_10%,rgba(124,58,237,0.10),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_400px] lg:gap-11">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-soft">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {TOTAL} шаблонов · бесплатно и без ограничений
              </span>
              <h1 className="mt-4 text-display-xl font-extrabold tracking-tight text-gray-900">
                Документы, которые{" "}
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                  готовы к подписи
                </span>
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-600">
                Выберите шаблон, заполните поля и скачайте готовый файл. Без регистрации — данные остаются в вашем браузере.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/builder"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg active:scale-[0.98]"
                >
                  Создать бесплатно
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#templates"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                >
                  Смотреть шаблоны
                </Link>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Без карты · без подписок · данные не покидают браузер
              </p>
            </div>

            {/* Social proof card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-900 to-dark-800 p-6 text-white shadow-elevated">
              <div className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.5),transparent_70%)]" />
              <div className="relative">
                <div className="mb-3 flex gap-0.5 text-amber-400" aria-label="Оценка 5 из 5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <h2 className="text-base font-bold">«Сделал расписку за 2 минуты»</h2>
                <p className="mt-0.5 text-[13px] text-slate-400">Алексей, Москва</p>
                <blockquote className="mt-4 border-l-2 border-purple-500 pl-3 text-[13.5px] leading-relaxed text-slate-200">
                  Обычно тратил вечер на поиск шаблона. Здесь просто выбрал, заполнил — и файл готов. Без регистрации.
                </blockquote>
                <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4 text-xs text-slate-400">
                  <div className="flex">
                    {[
                      ["М", "#2563eb"],
                      ["А", "#7c3aed"],
                      ["К", "#059669"],
                      ["+", "#f59e0b"],
                    ].map(([ch, bg], i) => (
                      <span
                        key={ch}
                        className="grid h-6 w-6 place-items-center rounded-full border-2 border-dark-900 text-[10px] font-bold text-white"
                        style={{ background: bg, marginLeft: i === 0 ? 0 : -8 }}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                  <span>
                    <b className="text-white">12 480</b> документов создано за месяц
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ============ WIDGET STRIP (погода + курсы + конвертер) ============ */}
          <div className="mt-6">
            <MarketWeatherStrip />
          </div>
        </div>
      </section>

      {/* ======================= BENTO ======================= */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Популярные шаблоны — тёмная плитка */}
          <div className="relative overflow-hidden rounded-3xl border border-dark-800 bg-gradient-to-br from-dark-900 to-dark-800 p-6 text-white shadow-soft transition-transform hover:-translate-y-1 sm:col-span-2 sm:row-span-2">
            <div className="pointer-events-none absolute -bottom-16 -right-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.35),transparent_70%)]" />
            <div className="relative">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Популярные шаблоны</h2>
              <p className="mt-1 text-sm text-slate-400">Самое востребованное прямо сейчас</p>
              <div className="mt-4 flex flex-col gap-1.5">
                {popular.slice(0, 4).map((t) => {
                  const c = CATEGORY_ICON[t.category] ?? CATEGORY_ICON.other;
                  const Icon = c.icon;
                  return (
                    <Link
                      key={t.id}
                      href={`/builder?template=${t.id}`}
                      className="group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/5"
                    >
                      <span className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-gradient-to-br ${c.grad}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{t.name}</span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Кол-во шаблонов */}
          <div className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-soft transition-transform hover:-translate-y-1">
            <div className="text-4xl font-extrabold tracking-tight text-brand-700">{TOTAL}</div>
            <p className="mt-1 text-sm text-gray-600">готовых шаблонов в каталоге</p>
          </div>

          {/* 152-ФЗ */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft transition-transform hover:-translate-y-1">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-900">152-ФЗ</h3>
            <p className="mt-1 text-sm text-gray-600">Данные обрабатываются в браузере</p>
          </div>

          {/* Проверено юристом */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-soft transition-transform hover:-translate-y-1 sm:col-span-2">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700">
              <BadgeCheck className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Проверено юристом</h3>
            <p className="mt-1 text-sm text-gray-600">
              Формулировки каждого шаблона проверены практикующим юристом на соответствие ГК РФ.
            </p>
          </div>

          {/* Двойная статистика */}
          <div className="flex flex-wrap items-center gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-soft transition-transform hover:-translate-y-1 sm:col-span-2">
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-gray-900">
                &lt;5 <small className="text-sm font-semibold text-gray-400">мин</small>
              </div>
              <p className="mt-1 text-sm text-gray-600">от выбора до готового файла</p>
            </div>
            <div className="h-12 w-px bg-gray-200" />
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-gray-900">
                0 <small className="text-sm font-semibold text-gray-400">загрузок</small>
              </div>
              <p className="mt-1 text-sm text-gray-600">на сервер — всё локально</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= TEMPLATES ======================= */}
      <HomeTemplateGrid />

      {/* ======================= HOW IT WORKS (timeline) ======================= */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-16">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">Как это работает</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
            Три шага до подписанного договора
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
            Никакой магии: выбираете документ, отвечаете на вопросы, скачиваете готовый файл.
          </p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-soft sm:p-8 md:grid-cols-3">
          {[
            { n: "1", t: "Выберите шаблон", d: `${TOTAL} проверенных документов в 6 категориях.`, grad: "from-brand-500 to-brand-600" },
            { n: "2", t: "Заполните поля", d: "Подсказки и автозаполнение — без юриста.", grad: "from-brand-500 to-brand-600" },
            { n: "3", t: "Скачайте и подпишите", d: "PDF или Word — сразу, без регистрации.", grad: "from-emerald-500 to-teal-600" },
          ].map((s, i) => (
            <div key={s.n} className="relative">
              <div className="mb-3 flex items-center gap-3">
                <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br ${s.grad} text-sm font-bold text-white`}>
                  {s.n}
                </span>
                {i < 2 && <span className="hidden h-px flex-1 bg-gradient-to-r from-brand-500/60 to-transparent md:block" />}
              </div>
              <h3 className="text-base font-bold text-gray-900">{s.t}</h3>
              <p className="mt-1 text-sm text-gray-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= SCANNER ======================= */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-16">
        <div className="grid overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft lg:grid-cols-2">
          <div className="p-6 sm:p-10">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">Сканер документов</span>
            <h2 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight text-gray-900">
              Фотографируете —<br />заполняется само
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Распознаём паспорт, ПТС и СТС прямо в браузере. Данные подставляются в форму автоматически, вы только проверяете.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { text: "Паспорт РФ — ФИО, серия, номер, адрес", icon: Camera },
                { text: "ПТС/СТС — VIN, номер, марка", icon: Car },
                { text: "Обработка только на вашем устройстве", icon: Shield },
                { text: "Работает без интернета", icon: FileLock },
              ].map(({ text, icon: Icon }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-600">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
            <Link
              href="/builder"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-700 active:scale-[0.98]"
            >
              Попробовать
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col justify-center gap-3 border-gray-100 bg-slate-50 p-6 sm:p-8 lg:border-l">
            {[
              { g: "from-brand-500 to-indigo-600", icon: FileText, t: "Паспорт РФ", d: "Распознано: ФИО, серия, адрес" },
              { g: "from-orange-500 to-red-600", icon: Car, t: "ПТС / СТС", d: "VIN и госномер найдены" },
              { g: "from-purple-500 to-indigo-600", icon: Download, t: "Договор заполнен", d: "Готов к скачиванию за 2 минуты" },
            ].map((r) => (
              <div key={r.d} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm">
                <div className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br ${r.g} text-white`}>
                  <r.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-xs font-semibold text-gray-900">{r.t}</b>
                  <span className="block truncate text-[11px] text-gray-600">{r.d}</span>
                </div>
                <FileCheck className="h-4 w-4 flex-shrink-0 text-emerald-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= TRUST ======================= */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-16">
        <div className="mb-8 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">Безопасность</span>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Почему нам доверяют</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: FileLock, t: "Данные под контролем", d: "Документы и черновики хранятся в вашем браузере. Точный серверный OCR и облачная синхронизация включаются только по вашему явному согласию." },
            { icon: Shield, t: "Соответствие 152-ФЗ", d: "Данные документов обрабатываются локально; серверное распознавание и партнёрские сервисы работают только после отдельного согласия (см. Политику)." },
            { icon: FileCheck, t: "Правовая проверка встроена", d: "Каждый шаблон содержит чек-лист соответствия требованиям закона и проверку обязательных полей перед печатью." },
          ].map((q) => (
            <div key={q.t} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft transition-transform hover:-translate-y-1">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white">
                <q.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-base font-bold text-gray-900">{q.t}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{q.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= FAQ ======================= */}
      <section className="mx-auto max-w-3xl px-4 pt-14 sm:px-6 sm:pt-16">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">
            <HelpCircle className="h-3.5 w-3.5" />
            Вопросы и ответы
          </span>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Частые вопросы</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-soft transition-shadow open:shadow-elevated"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-gray-900 marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ======================= SPLIT CTA ======================= */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-16">
        <div className="grid overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-elevated lg:grid-cols-[1.25fr_1fr]">
          <div className="p-7 sm:p-11">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-[25px]">
              Не знаете, с чего начать?
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-600">
              Начните с популярного шаблона — большинство пользователей выбирают именно эти. Файл будет готов через пару минут.
            </p>
            <Link
              href="/templates"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg active:scale-[0.98]"
            >
              Открыть каталог шаблонов
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-gray-500">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              Без карты · без подписок · без регистрации
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3 border-t border-gray-200 bg-gradient-to-br from-slate-50 to-brand-50 p-7 sm:p-8 lg:border-l lg:border-t-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Чаще всего выбирают
            </div>
            {popular.slice(0, 3).map((t) => {
              const c = CATEGORY_ICON[t.category] ?? CATEGORY_ICON.other;
              const Icon = c.icon;
              return (
                <Link
                  key={t.id}
                  href={`/builder?template=${t.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3.5 py-3 text-[13.5px] font-semibold text-gray-800 transition-all hover:-translate-y-0.5 hover:shadow-elevated"
                >
                  <span className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br ${c.grad}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{t.name}</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================= QUICK LINKS ======================= */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/converter", icon: ScanLine, t: "Конвертер PDF", d: "Объединить, разделить, сжать" },
            { href: "/templates", icon: FileStack, t: "Каталог шаблонов", d: `${TOTAL} документов в 6 категориях` },
            { href: "/blanks", icon: Download, t: "Бланки", d: "Готовые формы для печати" },
            { href: "/blog", icon: Sparkles, t: "Блог", d: "Разборы и правовые советы" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-300"
            >
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <l.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-gray-900 group-hover:text-brand-700">{l.t}</span>
                <span className="mt-0.5 block text-xs text-gray-600">{l.d}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ======================= FOOTER ======================= */}
      <footer className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-16">
        <div className="flex flex-wrap justify-between gap-6 border-t border-gray-200 pb-6 pt-8 text-xs text-gray-600">
          <span>© 2026 «Dogovor.expert». Не является юридической консультацией.</span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              Файл за пару минут
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              152-ФЗ · данные защищены
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}