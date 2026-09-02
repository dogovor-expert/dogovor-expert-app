"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { TEMPLATE_META } from "@/data/templatesMeta";
import Highlight from "@/components/ui/Highlight";
import { tokenGroups, scoreText, textMatchesTokens } from "@/lib/search";

const CATEGORY_ICONS: Record<string, string> = {
  auto: "🚗",
  realty: "🏠",
  business: "💼",
  finance: "💰",
  family: "❤️",
  legal: "⚖️",
  other: "📄",
  migration: "📄",
  postal: "📄",
};

export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const suggestions = useCallback(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    const tokens = tokenGroups(q);
    return TEMPLATE_META
      .filter((t) =>
        textMatchesTokens(
          `${t.name} ${t.description} ${(t.suggestedDocs || []).join(" ")}`,
          tokens
        )
      )
      .map((t) => ({
        t,
        score: Math.max(scoreText(t.name, tokens, 0), scoreText(t.description, tokens, 20)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [query]);

  const goSearch = useCallback((q: string) => {
    router.push(`/templates?q=${encodeURIComponent(q)}`);
  }, [router]);

  useEffect(() => {
    setActive(-1);
    setOpen(query.trim().length >= 2);
  }, [query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = suggestions();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActive((p) => (p + 1) % Math.max(items.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((p) => (p - 1 + Math.max(items.length, 1)) % Math.max(items.length, 1));
    } else if (e.key === "Enter") {
      if (open && active >= 0 && items[active]) {
        e.preventDefault();
        router.push(`/builder?template=${items[active].t.id}`);
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
      } else {
        e.preventDefault();
        const q = query.trim();
        if (q) goSearch(q);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const items = suggestions();
  const showList = open && items.length > 0;

  return (
    <div ref={rootRef} className="relative w-full sm:max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = query.trim();
          if (q) goSearch(q);
          setOpen(false);
        }}
        role="search"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls="header-search-listbox"
          aria-activedescendant={active >= 0 ? `header-search-opt-${active}` : undefined}
          aria-autocomplete="list"
          placeholder="Поиск документов, шаблонов..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(query.trim().length >= 2)}
          className="w-80 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
        />
      </form>
      {showList && (
        <div
          id="header-search-listbox"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-elevated z-50 py-1.5 overflow-hidden"
        >
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-gray-600 font-medium">
            Шаблоны
          </div>
          {items.map(({ t }, i) => (
            <button
              key={t.id}
              id={`header-search-opt-${i}`}
              role="option"
              aria-selected={active === i}
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                router.push(`/builder?template=${t.id}`);
                setOpen(false);
                setQuery("");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                active === i ? "bg-brand-50" : "bg-white"
              }`}
            >
              <span className="text-base flex-shrink-0">{CATEGORY_ICONS[t.category] || "📄"}</span>
              <span className="min-w-0">
                <span className="block text-sm text-gray-900 truncate">
                  <Highlight text={t.name} query={query} />
                </span>
                <span className="block text-xs text-gray-600 truncate">
                  <Highlight text={t.description} query={query} />
                </span>
              </span>
            </button>
          ))}
          <button
            onClick={() => {
              goSearch(query.trim());
              setOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-t border-gray-50 ${
              active >= items.length ? "bg-brand-50" : "bg-white"
            }`}
          >
            <Search className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <span className="text-sm text-brand-600 truncate">
              Показать все результаты по запросу «{query.trim()}»
            </span>
          </button>
        </div>
      )}
    </div>
  );
}