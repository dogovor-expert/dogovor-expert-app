import { useEffect, useRef, useState } from "react";

export interface SuggestOption {
  value: string;
  fillValue: string;
  sub?: string;
  extra?: Record<string, string>;
}

type SuggestOp = "suggest-fms-unit" | "suggest-address";

interface DadataSuggestion {
  value?: string;
  unrestricted_value?: string;
  code?: string;
  name?: string;
  data?: Record<string, unknown>;
}

const DADATA_HOST = "https://suggestions.dadata.ru/suggestions/api/4_1/rs";

function mapSuggestion(s: DadataSuggestion, op: SuggestOp): SuggestOption | null {
  if (op === "suggest-fms-unit") {
    const code = String(s.code ?? "");
    const name = String(s.name ?? s.value ?? "");
    if (!code && !name) return null;
    return {
      value: `${code} — ${name}`,
      fillValue: code,
      sub: name,
    };
  }
  const value = String(s.value ?? "");
  if (!value) return null;
  const d = s.data ?? {};
  const city =
    String(d.city_with_type ?? "") ||
    String(d.settlement_with_type ?? "") ||
    String(d.region_with_type ?? "");
  const extra: Record<string, string> = {};
  if (city) extra.city = city;
  return {
    value,
    fillValue: String(s.unrestricted_value ?? value),
    sub: String(d.postal_code ?? ""),
    extra,
  };
}

export function useDadataSuggest(op: SuggestOp) {
  const [suggestions, setSuggestions] = useState<SuggestOption[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const clear = () => {
    setSuggestions([]);
    setLoading(false);
    if (timer.current) clearTimeout(timer.current);
  };

  const apply = (q: string, items: DadataSuggestion[]) => {
    setSuggestions(
      items
        .map((s) => mapSuggestion(s, op))
        .filter((s): s is SuggestOption => !!s)
        .slice(0, 6)
    );
    void q;
  };

  const run = async (q: string) => {
    const clean = q.trim();
    if (clean.length < 3) {
      clear();
      return;
    }
    const mySeq = ++seq.current;
    setLoading(true);
    try {
      const res = await fetch("/api/dadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op, query: clean, count: 8 }),
      });
      if (res.ok) {
        const json = (await res.json()) as { suggestions?: DadataSuggestion[] };
        if (mySeq === seq.current) apply(clean, json.suggestions ?? []);
        return;
      }
      const json = (await res.json().catch(() => null)) as { fallback?: boolean } | null;
      if (!json?.fallback) {
        if (mySeq === seq.current) setSuggestions([]);
        return;
      }
      const key = typeof localStorage === "undefined" ? null : localStorage.getItem("dadata_key");
      if (!key) {
        if (mySeq === seq.current) setSuggestions([]);
        return;
      }
      const direct = await fetch(`${DADATA_HOST}/suggest/${op === "suggest-fms-unit" ? "fms_unit" : "address"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${key}` },
        body: JSON.stringify({ query: clean, count: 8 }),
      });
      if (direct.ok) {
        const json2 = (await direct.json()) as { suggestions?: DadataSuggestion[] };
        if (mySeq === seq.current) apply(clean, json2.suggestions ?? []);
      } else if (mySeq === seq.current) {
        setSuggestions([]);
      }
    } catch {
      if (mySeq === seq.current) setSuggestions([]);
    } finally {
      if (mySeq === seq.current) setLoading(false);
    }
  };

  const query = (q: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void run(q), 350);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { suggestions, loading, query, clear };
}