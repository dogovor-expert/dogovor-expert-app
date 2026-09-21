"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlignLeft,
  Archive,
  Droplets,
  FileDown,
  FileImage,
  FileText,
  Files,
  FileUp,
  Hash,
  Image as ImageIcon,
  LayoutGrid,
  PenLine,
  ScanText,
  Scissors,
  Search,
  Star,
  type LucideIcon,
} from "lucide-react";
import {
  CONVERTER_GROUPS,
  CONVERTER_TOOLS,
  type ConverterCategory,
} from "@/data/converter-tools";

const ICONS: Record<string, LucideIcon> = {
  Files,
  Scissors,
  LayoutGrid,
  Archive,
  Image: ImageIcon,
  FileImage,
  FileText,
  AlignLeft,
  FileDown,
  ScanText,
  PenLine,
  FileUp,
  Droplets,
  Hash,
};

const LS_KEY = "converter_favorites_v1";

export default function ConverterCatalog() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ConverterCategory | "all">("all");
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setFavs(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleFav = (slug: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const matches = useMemo(() => {
    const query = q.trim().toLowerCase();
    return CONVERTER_TOOLS.filter((t) => {
      if (cat !== "all" && t.category !== cat) return false;
      if (favOnly && !favs.has(t.slug)) return false;
      if (!query) return true;
      return (
        t.label.toLowerCase().includes(query) ||
        t.short.toLowerCase().includes(query) ||
        t.keywords.some((k) => k.toLowerCase().includes(query))
      );
    });
  }, [q, cat, favOnly, favs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск инструмента: объединить, сжать, OCR…"
            aria-label="Поиск инструмента"
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          type="button"
          onClick={() => setFavOnly((v) => !v)}
          aria-pressed={favOnly}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
            favOnly
              ? "border-amber-300 bg-amber-50 text-amber-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          <Star className={`h-4 w-4 ${favOnly ? "fill-amber-400 text-amber-400" : ""}`} />
          Избранное
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCat("all")}
          aria-pressed={cat === "all"}
          className={`rounded-full px-3 py-1.5 text-sm transition ${
            cat === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Все
        </button>
        {CONVERTER_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setCat(g.id)}
            aria-pressed={cat === g.id}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              cat === g.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {matches.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">Ничего не найдено. Измените запрос.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((t) => {
            const Icon = ICONS[t.iconName] ?? Files;
            const isFav = favs.has(t.slug);
            return (
              <div
                key={t.slug}
                className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFav(t.slug)}
                  aria-label={isFav ? "Убрать из избранного" : "В избранное"}
                  aria-pressed={isFav}
                  className="absolute right-3 top-3 rounded p-1 text-gray-300 hover:text-amber-400"
                >
                  <Star className={`h-4 w-4 ${isFav ? "fill-amber-400 text-amber-400" : ""}`} />
                </button>
                <Link href={`/converter/${t.slug}`} className="flex flex-1 flex-col">
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-medium text-gray-900">{t.label}</span>
                  <span className="mt-1 text-sm text-gray-500">{t.short}</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
