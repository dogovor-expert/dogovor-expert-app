"use client";

import { useState } from "react";

export interface CatalogItem {
  id: string;
  name: string;
  desc: string;
  ats: "safe" | "creative";
  parse: number;
  cats: string[];
  html: string;
}

const FILTERS: Array<[string, string]> = [
  ["all", "Все"],
  ["safe", "✓ ATS-safe"],
  ["creative", "⚠ Креативные"],
  ["exec", "Для руководства"],
  ["first", "Без опыта"],
];

/** Каталог шаблонов с живыми превью и фильтром по категориям. */
export function ResumeCatalog({ items }: { items: CatalogItem[] }) {
  const [filter, setFilter] = useState("all");
  const shown = items.filter((t) => filter === "all" || t.cats.includes(filter));
  return (
    <div>
      <div className="rs-chips" role="group" aria-label="Категории шаблонов">
        {FILTERS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={`rs-chip${filter === k ? " on" : ""}`}
            aria-pressed={filter === k}
            onClick={() => setFilter(k)}
          >
            {k === "all" ? `Все (${items.length})` : label}
          </button>
        ))}
      </div>
      <div className="rs-grid">
        {shown.map((t) => (
          <article key={t.id} className="rs-card" data-cat={t.cats.join(" ")}>
            <a
              className="rs-shot"
              href={`/resume?tpl=${t.id}#studio`}
              aria-label={`Выбрать шаблон ${t.name}`}
              title={`Выбрать шаблон ${t.name}`}
            >
              <span className="rs-shot-in" aria-hidden="true">
                <span className={`a4 t-${t.id} rs-mini`} dangerouslySetInnerHTML={{ __html: t.html }} />
              </span>
              <span className="rs-go">Выбрать →</span>
            </a>
            <div className="rs-meta">
              <div className="rs-name">
                <b>{t.name}</b>
                <span className={`rs-badge ${t.ats === "safe" ? "safe" : "cre"}`}>
                  {t.ats === "safe" ? `✓ ${t.parse}%` : `⚠ ${t.parse}%`}
                </span>
              </div>
              <p>{t.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/** Кнопка «скопировать» для примеров формулировок. */
export function CopyBtn({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="rs-copy"
      aria-label={label}
      onClick={() => {
        try {
          void navigator.clipboard?.writeText(text);
        } catch {
          /* ignore */
        }
        setOk(true);
        window.setTimeout(() => setOk(false), 1800);
      }}
    >
      {ok ? "Скопировано ✓" : "Скопировать"}
    </button>
  );
}

/** Вкладки «плохо → хорошо» для ATS-секции. */
export function PhraseTabs({ items }: { items: Array<{ key: string; label: string; bad: string; good: string }> }) {
  const [active, setActive] = useState(0);
  const cur = items[Math.min(active, items.length - 1)];
  if (!cur) return null;
  return (
    <div>
      <div className="rs-chips" role="tablist" aria-label="Примеры профессий">
        {items.map((it, i) => (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`rs-chip${i === active ? " on" : ""}`}
            onClick={() => setActive(i)}
          >
            {it.label}
          </button>
        ))}
      </div>
      <div className="rs-ba">
        <div className="rs-ba-r bad"><span className="b">✗</span><span>{cur.bad}</span></div>
        <div className="rs-ba-r good"><span className="b">✓</span><span>{cur.good}</span></div>
        <div className="rs-ba-foot">
          <CopyBtn text={cur.good} label="Скопировать хорошую формулировку" />
        </div>
      </div>
    </div>
  );
}
