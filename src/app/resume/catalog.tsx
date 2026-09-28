"use client";

import { useMemo, useState } from "react";
import { FileDown, FileText, Loader2, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SAMPLE_RESUME } from "@/lib/resume/data";
import { buildResumeDocHtml } from "@/lib/resume/render";
import type { TemplateId } from "@/lib/resume/types";

export interface CatalogItem {
  id: TemplateId;
  name: string;
  desc: string;
  ats: "safe" | "creative";
  parse: number;
  cats: string[];
  html: string;
  category: string;
  rating: number;
  downloads: string;
  badge?: string;
}

const ALL_LABEL = "Все шаблоны";

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function TemplateCard({ item }: { item: CatalogItem }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "PDF" | "DOC">(null);

  const handleQuickDownload = async (fmt: "PDF" | "DOC") => {
    if (busy) return;
    setBusy(fmt);
    try {
      if (fmt === "PDF") {
        const { renderResumePdf } = await import("@/lib/resume/resumePdf");
        const blob = await renderResumePdf(SAMPLE_RESUME, item.id);
        saveBlob(blob, `Резюме — ${item.name} (образец).pdf`);
      } else {
        const html = buildResumeDocHtml(SAMPLE_RESUME, item.id);
        saveBlob(new Blob(["\ufeff", html], { type: "application/msword" }), `Резюме — ${item.name} (образец).doc`);
      }
      setMsg(`Бланк ${fmt} скачан`);
      window.setTimeout(() => setMsg(null), 2500);
    } catch {
      setMsg("Не удалось скачать, попробуйте ещё раз");
      window.setTimeout(() => setMsg(null), 2500);
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-900/10">
      {/* A4 Document Preview Header */}
      <a
        href={`/resume?tpl=${item.id}#studio`}
        aria-label={`Выбрать шаблон ${item.name}`}
        className="relative block h-64 cursor-pointer overflow-hidden bg-slate-100/90 p-4"
      >
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(203, 213, 225, 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(203, 213, 225, 0.6) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Scaled real A4 template preview */}
        <div className="relative mx-auto h-full w-[220px] overflow-hidden rounded-[3px] border border-slate-200 bg-white drop-shadow-lg transition-transform duration-500 group-hover:scale-105">
          <div
            aria-hidden="true"
            className={cn("a4", `t-${item.id}`)}
            style={{ width: 794, transform: "scale(0.2771)", transformOrigin: "top left", pointerEvents: "none" }}
            dangerouslySetInnerHTML={{ __html: item.html }}
          />
        </div>

        {/* Hover overlay hint */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <span className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-lg">
            Открыть в студии резюме →
          </span>
        </div>

        <span className="absolute left-3.5 top-3.5 rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
          {item.category}
        </span>
        {item.badge ? (
          <span className="absolute right-3.5 top-3.5 rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-slate-900 shadow-sm">
            {item.badge}
          </span>
        ) : (
          <span
            className={cn(
              "absolute right-3.5 top-3.5 rounded-md px-2 py-0.5 text-[10px] font-extrabold shadow-sm",
              item.ats === "safe" ? "bg-emerald-400 text-emerald-950" : "bg-amber-400 text-slate-900",
            )}
          >
            {item.ats === "safe" ? `✓ ${item.parse}%` : `⚠ ${item.parse}%`}
          </span>
        )}
      </a>

      {/* Card Info */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900 transition group-hover:text-indigo-600">{item.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {item.rating}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{item.desc}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">PDF (300 DPI)</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">DOCX Word</span>
          <span className="ml-auto font-semibold text-emerald-700">ATS ОК</span>
        </div>

        {/* Download Buttons */}
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3.5">
          <button
            type="button"
            onClick={() => void handleQuickDownload("PDF")}
            disabled={busy !== null}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
          >
            {busy === "PDF" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
            PDF
          </button>
          <button
            type="button"
            onClick={() => void handleQuickDownload("DOC")}
            disabled={busy !== null}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === "DOC" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
            DOCX
          </button>
        </div>

        <div className="mt-2 text-center text-[10px] text-slate-400">
          {msg ? <span className="font-bold text-emerald-600">✓ {msg}</span> : `Скачано ${item.downloads} раз · бесплатно`}
        </div>
      </div>
    </article>
  );
}

/** Каталог шаблонов: поиск, категории и карточки с живыми превью реальных макетов. */
export function ResumeCatalog({ items }: { items: CatalogItem[] }) {
  const [filter, setFilter] = useState(ALL_LABEL);
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const t of items) if (!seen.includes(t.category)) seen.push(t.category);
    return [ALL_LABEL, ...seen];
  }, [items]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((t) => {
      const matchCat = filter === ALL_LABEL || t.category === filter;
      const matchQuery = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [items, filter, query]);

  const countOf = (key: string) =>
    key === ALL_LABEL ? items.length : items.filter((t) => t.category === key).length;

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">
            Каталог шаблонов резюме
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {items.length} готовых бланков резюме для любых профессий
          </h2>
          <p className="mt-2 text-base text-slate-500">
            Каждый шаблон оптимизирован для печати в формате А4 и чтения HR-сканерами
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск шаблона: фото, сайдбар, минимализм…"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none ring-indigo-500/20 transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4"
          />
        </div>
      </div>

      <div className="-mx-6 mt-8 overflow-x-auto px-6 pb-2 [scrollbar-width:none]">
        <div className="flex gap-2" role="group" aria-label="Категории шаблонов">
          {categories.map((label) => {
            const active = filter === label;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(label)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition sm:text-sm",
                  active
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <span>{label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {countOf(label)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((t) => (
          <TemplateCard key={t.id} item={t} />
        ))}
      </div>

      {shown.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-700">Шаблон не найден</h3>
          <p className="mt-1 text-xs text-slate-500">
            Попробуйте изменить поисковый запрос или выбрать категорию «Все шаблоны».
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter(ALL_LABEL);
            }}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Сбросить поиск
          </button>
        </div>
      )}
    </div>
  );
}
