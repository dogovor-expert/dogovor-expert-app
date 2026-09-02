"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface BlankItem {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface BlankCategory {
  id: string;
  label: string;
  count: number;
}

export default function BlanksBrowser({
  items,
  categories,
}: {
  items: BlankItem[];
  categories: BlankCategory[];
}) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (activeCat !== "all" && it.category !== activeCat) return false;
      if (!q) return true;
      const hay = `${it.name} ${it.description} ${it.id}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, activeCat, q]);

  const byCategory = useMemo(() => {
    const map = new Map<string, BlankItem[]>();
    for (const it of filtered) {
      const arr = map.get(it.category) ?? [];
      arr.push(it);
      map.set(it.category, arr);
    }
    return categories
      .filter((c) => map.has(c.id))
      .map((c) => ({ ...c, items: map.get(c.id) ?? [] }));
  }, [filtered, categories]);

  const showGrouped = activeCat === "all" && !q;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск бланка: договор аренды, расписка, счёт…"
            aria-label="Поиск пустого бланка"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill
          active={activeCat === "all"}
          onClick={() => setActiveCat("all")}
          label="Все"
          count={items.length}
        />
        {categories.map((c) => (
          <FilterPill
            key={c.id}
            active={activeCat === c.id}
            onClick={() => setActiveCat(c.id)}
            label={c.label}
            count={c.count}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          По запросу «{query}» ничего не найдено. Попробуйте другое слово или{" "}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveCat("all");
            }}
            className="text-indigo-600 underline"
          >
            сбросьте фильтр
          </button>
          .
        </p>
      ) : showGrouped ? (
        byCategory.map((group) => (
          <section key={group.id}>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              {group.label}
              <span className="text-sm font-normal text-gray-400">
                ({group.items.length})
              </span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.items.map((t) => (
                <BlankCard key={t.id} item={t} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <BlankCard key={t.id} item={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3.5 py-2 rounded-full text-sm font-medium transition border " +
        (active
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-600")
      }
    >
      {label}
      <span className={active ? "text-indigo-100" : "text-gray-400"}> {count}</span>
    </button>
  );
}

function BlankCard({ item }: { item: BlankItem }) {
  return (
    <Link
      href={`/blanks/${item.id}`}
      className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition"
    >
      <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 leading-snug">
        {item.name}
      </p>
      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
        {item.description}
      </p>
      <p className="text-xs text-indigo-600 mt-2 font-medium">Скачать бланк →</p>
    </Link>
  );
}
