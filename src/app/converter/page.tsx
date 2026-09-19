"use client";
import { useEffect, useRef, useState } from "react";
import {
  Files, Scissors, Image as ImageIcon, FileImage, ScanText, PenLine, FileText,
  ShieldCheck, LayoutGrid, Droplets, Hash, Archive, Search, Star, AlignLeft, FileDown, FileUp,
} from "lucide-react";
import dynamic from "next/dynamic";

const MergePdf = dynamic(() => import("@/components/converter/MergePdf"), { ssr: false });
const SplitPdf = dynamic(() => import("@/components/converter/SplitPdf"), { ssr: false });
const OrganizePages = dynamic(() => import("@/components/converter/OrganizePages"), { ssr: false });
const CompressPdf = dynamic(() => import("@/components/converter/CompressPdf"), { ssr: false });
const ImagesToPdf = dynamic(() => import("@/components/converter/ImagesToPdf"), { ssr: false });
const PdfToImages = dynamic(() => import("@/components/converter/PdfToImages"), { ssr: false });
const DocxToPrint = dynamic(() => import("@/components/converter/DocxToPrint"), { ssr: false });
const OcrTool = dynamic(() => import("@/components/converter/OcrTool"), { ssr: false });
const SignPdf = dynamic(() => import("@/components/converter/SignPdf"), { ssr: false });
const Watermark = dynamic(() => import("@/components/converter/Watermark"), { ssr: false });
const PageNumbers = dynamic(() => import("@/components/converter/PageNumbers"), { ssr: false });
const PdfToText = dynamic(() => import("@/components/converter/PdfToText"), { ssr: false });
const PdfToWord = dynamic(() => import("@/components/converter/PdfToWord"), { ssr: false });
const TextToPdf = dynamic(() => import("@/components/converter/TextToPdf"), { ssr: false });

type Tool = { id: string; label: string; icon: React.ElementType; desc: string; comp: React.ElementType; pop?: boolean };

const GROUPS: { id: string; label: string; tools: Tool[] }[] = [
  {
    id: "pdf",
    label: "Работа с PDF",
    tools: [
      { id: "merge", label: "Объединить PDF", icon: Files, desc: "Склеить несколько PDF в один", comp: MergePdf, pop: true },
      { id: "split", label: "Разделить PDF", icon: Scissors, desc: "Извлечь страницы в отдельный файл", comp: SplitPdf, pop: true },
      { id: "organize", label: "Редактор страниц", icon: LayoutGrid, desc: "Порядок, поворот, удаление", comp: OrganizePages, pop: true },
      { id: "compress", label: "Сжать PDF", icon: Archive, desc: "Уменьшить размер файла", comp: CompressPdf, pop: true },
    ],
  },
  {
    id: "convert",
    label: "Конвертация",
    tools: [
      { id: "img2pdf", label: "JPG → PDF", icon: ImageIcon, desc: "Фото и сканы в документ A4", comp: ImagesToPdf, pop: true },
      { id: "pdf2img", label: "PDF → JPG", icon: FileImage, desc: "Каждая страница — картинка", comp: PdfToImages },
      { id: "docx", label: "DOCX → PDF", icon: FileText, desc: "Word в печать / PDF", comp: DocxToPrint },
      { id: "pdf2text", label: "PDF → текст", icon: AlignLeft, desc: "Извлечь текст из PDF в TXT", comp: PdfToText },
      { id: "pdf2word", label: "PDF → Word", icon: FileDown, desc: "Текст PDF в редактируемый DOCX", comp: PdfToWord },
    ],
  },
  {
    id: "text",
    label: "Текст и подпись",
    tools: [
      { id: "ocr", label: "Скан → текст", icon: ScanText, desc: "Распознавание русского (OCR)", comp: OcrTool, pop: true },
      { id: "sign", label: "Подпись в PDF", icon: PenLine, desc: "Поставить подпись в документ", comp: SignPdf },
      { id: "text2pdf", label: "Текст → PDF", icon: FileUp, desc: "Текст или .txt в документ А4", comp: TextToPdf },
    ],
  },
  {
    id: "mark",
    label: "Разметка",
    tools: [
      { id: "watermark", label: "Водяной знак", icon: Droplets, desc: "Текст на страницах файла", comp: Watermark },
      { id: "pagenum", label: "Нумерация страниц", icon: Hash, desc: "Номера в колонтитуле", comp: PageNumbers },
    ],
  },
];

const ALL_TOOLS = GROUPS.flatMap((g) => g.tools);
const LS_KEY = "converter_favorites_v1";

export default function ConverterPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [active, setActive] = useState("merge");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) setFavs(new Set(parsed.filter((x): x is string => typeof x === "string")));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("tool");
    if (id && ALL_TOOLS.some((t) => t.id === id)) setActive(id);
  }, []);

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const selectTool = (id: string) => {
    setActive(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tool", id);
    window.history.replaceState(null, "", url.pathname + "?" + url.searchParams.toString());
    if (window.innerWidth < 1024) panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const matches = (t: Tool, gid: string) => {
    if (cat !== "all" && gid !== cat) return false;
    if (favOnly && !favs.has(t.id)) return false;
    const query = q.trim().toLowerCase();
    if (query && !(t.label + " " + t.desc).toLowerCase().includes(query)) return false;
    return true;
  };

  const current = ALL_TOOLS.find((t) => t.id === active) ?? ALL_TOOLS[0];
  const Component = current.comp;
  const Icon = current.icon;
  const currentGid = GROUPS.find((g) => g.tools.some((t) => t.id === current.id))?.id ?? "";
  const related = (() => {
    const same = ALL_TOOLS.filter(
      (t) => t.id !== current.id && GROUPS.some((g) => g.id === currentGid && g.tools.some((x) => x.id === t.id)),
    );
    const extra = ALL_TOOLS.filter((t) => t.pop && t.id !== current.id && !same.includes(t));
    return [...same, ...extra].slice(0, 4);
  })();

  const visibleCount = GROUPS.flatMap((g) => g.tools.filter((t) => matches(t, g.id))).length;
  const catCount = (id: string) => (id === "all" ? ALL_TOOLS.length : GROUPS.find((g) => g.id === id)?.tools.length ?? 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex items-start gap-3">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-white border border-brand-200 text-brand-600 grid place-items-center shadow-soft">
          <Files className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Конвертер документов</h1>
          <p className="mt-1 text-sm text-gray-500">PDF, JPG, Word, распознавание текста — всё в браузере</p>
          <p className="mt-1 text-[10.5px] font-mono text-gray-400">14 инструментов · 4 категории · работает без загрузки на сервер</p>
        </div>
      </header>

      <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <p className="text-[12.5px] text-emerald-800 leading-relaxed">
          Все операции выполняются прямо в вашем браузере — файлы не загружаются на сервер и не покидают устройство.
          Соответствует требованиям 152-ФЗ к обработке персональных данных.
        </p>
      </div>

      <div className="mt-5 rounded-2xl bg-white border border-gray-200 shadow-soft p-4 sm:p-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск: объединить, сжать, OCR…"
              className="w-full bg-gray-50 border border-gray-200 text-sm py-2.5 pl-9 pr-3 rounded-xl focus:border-brand-400 focus:bg-white outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setFavOnly((v) => !v)}
            aria-pressed={favOnly}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              favOnly ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favOnly ? "fill-brand-500 text-brand-500" : ""}`} />
            Избранное{favs.size ? ` (${favs.size})` : ""}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[{ id: "all", label: "Все" }, ...GROUPS.map((g) => ({ id: g.id, label: g.label }))].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-colors cursor-pointer ${
                cat === c.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
              }`}
            >
              {c.label} <span className="text-gray-400">{catCount(c.id)}</span>
            </button>
          ))}
          <span className="ml-auto text-[11px] text-gray-400">{visibleCount} из {ALL_TOOLS.length}</span>
        </div>

        <div className="mt-4 grid lg:grid-cols-5 gap-5 items-start">
          <aside className="lg:col-span-2 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-2 max-h-[70vh] overflow-y-auto scrollbar-thin">
              {GROUPS.map((g) => {
                const items = g.tools.filter((t) => matches(t, g.id));
                if (!items.length) return null;
                return (
                  <div key={g.id} className="mb-1.5 last:mb-0">
                    <p className="px-2 py-1.5 text-[10px] font-bold tracking-[0.12em] uppercase text-gray-500">{g.label}</p>
                    {items.map((t) => {
                      const TIcon = t.icon;
                      const isActive = t.id === active;
                      const fav = favs.has(t.id);
                      return (
                        <div
                          key={t.id}
                          className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 mb-0.5 transition-colors ${
                            isActive ? "border-brand-500 bg-brand-50 shadow-soft" : "border-transparent hover:border-gray-200 hover:bg-white"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => selectTool(t.id)}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                          >
                            <span
                              className={`shrink-0 w-8 h-8 rounded-lg border grid place-items-center ${
                                isActive ? "bg-brand-600 border-transparent text-white" : "bg-white border-gray-200 text-gray-500"
                              }`}
                            >
                              <TIcon className="w-4 h-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block text-xs font-semibold truncate ${isActive ? "text-brand-800" : "text-gray-800"}`}>{t.label}</span>
                              <span className="block text-[10.5px] text-gray-500 truncate">{t.desc}</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFav(t.id)}
                            aria-label={fav ? "Убрать из избранного" : "В избранное"}
                            aria-pressed={fav}
                            className="shrink-0 w-7 h-7 grid place-items-center rounded-full hover:bg-white cursor-pointer"
                          >
                            <Star className={`w-3.5 h-3.5 ${fav ? "fill-brand-500 text-brand-500" : "text-gray-300 hover:text-brand-500"}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {visibleCount === 0 && <p className="px-3 py-6 text-center text-xs text-gray-400">Ничего не найдено. Измените запрос или фильтр.</p>}
            </div>
          </aside>

          <section ref={panelRef} className="lg:col-span-3 scroll-mt-24">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-soft overflow-hidden">
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-gray-100">
                <span className="shrink-0 w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 grid place-items-center">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-extrabold text-gray-900">{current.label}</span>
                  <span className="block text-[11.5px] text-gray-500">{current.desc}</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleFav(current.id)}
                  aria-label={favs.has(current.id) ? "Убрать из избранного" : "В избранное"}
                  aria-pressed={favs.has(current.id)}
                  className="shrink-0 w-9 h-9 grid place-items-center rounded-xl border border-gray-200 hover:border-brand-300 cursor-pointer"
                >
                  <Star className={`w-4 h-4 ${favs.has(current.id) ? "fill-brand-500 text-brand-500" : "text-gray-300"}`} />
                </button>
              </div>
              <div className="p-4 sm:p-5">
                <Component />
              </div>
              {related.length > 0 && (
                <div className="px-4 sm:px-5 py-3.5 border-t border-gray-100 bg-gray-50/60">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2">С этим также работают</p>
                  <div className="flex flex-wrap gap-2">
                    {related.map((r) => {
                      const RIcon = r.icon;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => selectTool(r.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[11px] font-medium text-gray-700 hover:border-brand-300 hover:text-brand-700 cursor-pointer"
                        >
                          <RIcon className="w-3.5 h-3.5" />
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="mt-10">
        <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">Как это работает</div>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-gray-900">Документы не покидают устройство</h2>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {[
            { t: "Выберите инструмент", d: "Объединение, разделение, сжатие, конвертация или распознавание." },
            { t: "Загрузите файл", d: "Он обрабатывается локально в браузере — без отправки на сервер." },
            { t: "Скачайте результат", d: "Готовый файл сохраняется прямо на ваше устройство." },
          ].map((s, i) => (
            <div key={s.t} className="rounded-2xl bg-white border border-gray-100 shadow-soft p-4">
              <span className="inline-grid place-items-center w-7 h-7 rounded-lg bg-brand-50 text-brand-600 text-xs font-extrabold">{i + 1}</span>
              <p className="mt-2.5 text-sm font-bold text-gray-900">{s.t}</p>
              <p className="mt-1 text-[12px] text-gray-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">Возможности</div>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-gray-900">Что умеет конвертер</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {[
            { t: "PDF", d: "Объединение, разделение, порядок и поворот страниц, удаление лишних, сжатие размера." },
            { t: "Изображения", d: "JPG/PNG в PDF формата A4 и обратно — каждая страница отдельной картинкой (до 300 dpi)." },
            { t: "Текст", d: "Извлечение и перенос текста между PDF и Word, распознавание сканов (OCR) — всё прямо в браузере." },
            { t: "Разметка", d: "Водяной знак с настройкой цвета и прозрачности, нумерация страниц в колонтитуле." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl bg-white border border-gray-100 shadow-soft p-4">
              <p className="text-sm font-bold text-gray-900">{c.t}</p>
              <p className="mt-1 text-[12px] text-gray-500 leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 border border-brand-200 p-6 sm:p-7 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-extrabold tracking-tight text-gray-900">Нужен готовый документ, а не файл?</h2>
          <p className="mt-1 text-[13px] text-gray-600 leading-relaxed">
            Соберите договор, заявление или претензию в конструкторе — 50+ шаблонов с автоподстановкой реквизитов.
          </p>
        </div>
        <a
          href="/builder"
          className="shrink-0 inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
        >
          Перейти к конструктору →
        </a>
      </section>

      <p className="mt-6 text-xs text-gray-500 text-center">
        Инструменты предоставляются «как есть» и носят вспомогательный характер. Перед подписанием документов проверяйте итоговый файл.
      </p>
    </div>
  );
}
