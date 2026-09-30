"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

interface BlogStats {
  exportPdfToday: number | null;
  top: string[];
}

/** Живой тёмный CTA: статы с /api/blog/stats, тикер = реальные топ-3 шаблона сегодня. */
export default function BlogLiveCta({ templatesCount }: { templatesCount: number }) {
  const [stats, setStats] = useState<BlogStats | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/blog/stats", { headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: BlogStats | null) => {
        if (active && d) setStats(d);
      })
      .catch(() => {
        /* оставляем плейсхолдеры */
      });
    return () => {
      active = false;
    };
  }, []);

  const docsToday = stats?.exportPdfToday;
  const tickerItems = stats?.top ?? [];

  return (
    <section className="relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_220px_at_12%_0%,rgba(37,99,235,0.35),transparent_60%),radial-gradient(520px_200px_at_88%_100%,rgba(109,40,217,0.32),transparent_62%)]"
      />
      {/* Две колонки только когда карточке хватает ширины: на /blog она живёт в
          узкой колонке minmax(0,1fr), и lg-брейкпоинт срабатывал уже при ~334px,
          сжимая текст в одну букву на строку. Ниже — аккуратный стекучий layout. */}
      <div className="relative grid gap-8 p-7 sm:p-10 min-[1350px]:grid-cols-[1.15fr_0.85fr] min-[1350px]:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Данные обновляются в реальном времени
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">
            Нужен сам договор, а не статья?
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
            Откройте конструктор — он подскажет поля, проверит реквизиты и за пару
            минут соберёт аккуратный PDF или Word. Бесплатно и без регистрации.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow transition hover:bg-slate-100"
            >
              Открыть конструктор
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Готовые шаблоны
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-black text-white">
              {docsToday === null || docsToday === undefined ? "—" : docsToday.toLocaleString("ru-RU")}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-slate-400">документов создано сегодня</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-black text-white">{templatesCount.toLocaleString("ru-RU")}+</p>
            <p className="mt-1 text-[11px] leading-snug text-slate-400">готовых шаблонов</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-black text-white">0 ₽</p>
            <p className="mt-1 text-[11px] leading-snug text-slate-400">бесплатно и без регистрации</p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-black/10">
        <div className="flex overflow-hidden py-3">
          <div className="flex min-w-max animate-marquee items-center gap-12 whitespace-nowrap px-6">
            {[0, 1].map((k) => (
              <p key={k} className="flex items-center gap-2 text-xs text-slate-400">
                <FileText className="h-3.5 w-3.5 text-brand-400" />
                {tickerItems.length > 0
                  ? `Чаще всего сегодня создают: ${tickerItems.join(" · ")}`
                  : "Документы собираются прямо в браузере — файлы никуда не передаются."}
              </p>
            ))}
          </div>
        </div>
      </div>
      </section>
  );
}