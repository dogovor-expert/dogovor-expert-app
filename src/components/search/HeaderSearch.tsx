"use client";
import { useId, useState, useRef, useEffect, useCallback, useMemo } from "react";
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

type ScoredItem = {
  t: (typeof TEMPLATE_META)[number];
  score: number;
};

function scoreItems(q: string, tokens: string[][]): ScoredItem[] {
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
}

export default function HeaderSearch() {
  const router = useRouter();
  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const listboxMobileId = `${uid}-listbox-m`;
  const optId = (i: number) => `${uid}-opt-${i}`;
  const optMobileId = (i: number) => `${uid}-opt-m-${i}`;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  // Отдельный ref для мобильного оверлея: общий ref с десктоп-полем терялся
  // при закрытии оверлея (React обнулял ref, висящий на том же объекте).
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [] as ReturnType<typeof scoreItems>;
    const tokens = tokenGroups(q);
    return scoreItems(q, tokens);
  }, [query]);

  const goSearch = useCallback((q: string) => {
    router.push(`/templates?q=${encodeURIComponent(q)}`);
  }, [router]);

  useEffect(() => {
    setActive(-1);
    setOpen(query.trim().length >= 2);
  }, [query]);

  useEffect(() => {
    if (mobileOpen) {
      const id = setTimeout(() => mobileInputRef.current?.focus(), 100);
      return () => clearTimeout(id);
    }
  }, [mobileOpen]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const closeAll = useCallback(() => {
    setOpen(false);
    setMobileOpen(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
        closeAll();
        setQuery("");
        (e.currentTarget as HTMLInputElement).blur();
      } else {
        e.preventDefault();
        const q = query.trim();
        if (q) goSearch(q);
      }
    } else if (e.key === "Escape") {
      closeAll();
      (e.currentTarget as HTMLInputElement).blur();
    } else if (e.key === "Tab") {
      closeAll();
    }
  };

  const showList = open && items.length > 0;

  const SuggestionsList = ({ id, optIdFn, className }: { id: string; optIdFn: (i: number) => string; className?: string }) => (
    <div
      id={id}
      role="listbox"
      className={className}
    >
      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-gray-600 font-medium">
        Шаблоны
      </div>
      {items.map(({ t }, i) => (
        <button
          key={t.id}
          id={optIdFn(i)}
          role="option"
          aria-selected={active === i}
          onMouseEnter={() => setActive(i)}
          onClick={() => {
            router.push(`/builder?template=${t.id}`);
            closeAll();
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
          closeAll();
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
  );

  return (
    <div ref={rootRef} className="relative sm:flex-1 sm:min-w-0 sm:max-w-md">
      {/* Desktop (sm+): inline search form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = query.trim();
          if (q) goSearch(q);
          setOpen(false);
        }}
        role="search"
        className="hidden sm:block"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-activedescendant={active >= 0 ? optId(active) : undefined}
          aria-autocomplete="list"
          aria-label="Поиск документов и шаблонов"
          placeholder="Поиск документов, шаблонов..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(query.trim().length >= 2)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
        />
      </form>
      {showList && <SuggestionsList id={listboxId} optIdFn={optId} className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-elevated z-50 py-1.5 overflow-hidden hidden sm:block" />}

      {/* Mobile (<sm): icon button + full-width overlay */}
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        className="sm:hidden p-3 hover:bg-gray-100 rounded-lg"
        aria-label="Поиск"
      >
        <Search className="w-5 h-5 text-gray-600" />
      </button>
      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 z-50 bg-white border-b border-gray-100 shadow-lg p-4 sm:hidden">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              if (q) goSearch(q);
              closeAll();
            }}
            role="search"
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            <input
              ref={mobileInputRef}
              type="text"
              role="combobox"
              aria-expanded={showList}
              aria-controls={listboxMobileId}
              aria-activedescendant={active >= 0 ? optMobileId(active) : undefined}
              aria-autocomplete="list"
              aria-label="Поиск документов и шаблонов"
              placeholder="Поиск документов, шаблонов..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setOpen(query.trim().length >= 2)}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); mobileInputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                aria-label="Очистить"
              >
                ×
              </button>
            )}
          </form>
          {showList && (
            <div
              id={listboxMobileId}
              role="listbox"
              className="mt-2 bg-white border border-gray-100 rounded-xl shadow-elevated py-1.5 overflow-hidden max-h-[60vh] overflow-y-auto"
            >
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-gray-600 font-medium">
                Шаблоны
              </div>
              {items.map(({ t }, i) => (
                <button
                  key={t.id}
                  id={optMobileId(i)}
                  role="option"
                  aria-selected={active === i}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    router.push(`/builder?template=${t.id}`);
                    closeAll();
                    setQuery("");
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
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
                  closeAll();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-t border-gray-50 bg-white"
              >
                <Search className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <span className="text-sm text-brand-600 truncate">
                  Показать все результаты по запросу «{query.trim()}»
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
