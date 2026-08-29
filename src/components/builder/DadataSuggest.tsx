import { useEffect, useRef, useState } from "react";

export interface SuggestOption {
  value: string;
  fillValue: string;
  sub?: string;
  extra?: Record<string, string>;
}

type SuggestOp = "suggest-fms-unit" | "suggest-address" | "suggest-fio" | "find-fio" | "suggest-passport";

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
  if (op === "suggest-fio" || op === "find-fio") {
    const d = s.data ?? {};
    const fio = [String(d.surname ?? ""), String(d.name ?? ""), String(d.patronymic ?? "")]
      .filter(Boolean)
      .join(" ");
    if (!fio) return null;
    const extra: Record<string, string> = {};
    if (d.gender) extra.gender = d.gender === "MALE" ? "М" : "Ж";
    if (d.birthdate) extra.birthdate = String(d.birthdate);
    if (d.passport_series) extra.passport_series = String(d.passport_series);
    if (d.passport_number) extra.passport_number = String(d.passport_number);
    if (d.passport_issue_date) extra.passport_issue_date = String(d.passport_issue_date);
    if (d.passport_issued_by) extra.passport_issued_by = String(d.passport_issued_by);
    if (d.passport_code) extra.passport_code = String(d.passport_code);
    if (d.snils) extra.snils = String(d.snils);
    if (d.inn) extra.inn = String(d.inn);
    const value = String(s.value ?? "");
    return {
      value: fio || value,
      fillValue: fio || value,
      sub: `Пол: ${d.gender === "MALE" ? "М" : d.gender === "FEMALE" ? "Ж" : "—"} ${d.birthdate ? `, ${d.birthdate}` : ""}`,
      extra,
    };
  }
  if (op === "suggest-passport") {
    const d = s.data ?? {};
    const series = String(d.passport_series ?? "");
    const number = String(d.passport_number ?? "");
    if (!series && !number) return null;
    const extra: Record<string, string> = {};
    if (d.passport_issue_date) extra.issue_date = String(d.passport_issue_date);
    if (d.passport_issued_by) extra.issued_by = String(d.passport_issued_by);
    if (d.passport_code) extra.code = String(d.passport_code);
    const value = `${series} ${number}`.trim();
    return {
      value,
      fillValue: value,
      sub: `Выдан: ${d.passport_issued_by ?? "—"} ${d.passport_issue_date ? `, ${d.passport_issue_date}` : ""}`,
      extra,
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
      const opMap: Record<string, string> = {
    "suggest-fms-unit": "fms_unit",
    "suggest-address": "address",
    "suggest-fio": "fio",
    "suggest-passport": "passport",
    "find-fio": "fio", // find-fio использует findById/fio (POST), не suggest
  };
  const directOp = opMap[op] || "address";
  // find-fio использует findById/fio — другой endpoint
  const directUrl = op === "find-fio"
    ? `${DADATA_HOST}/findById/fio`
    : `${DADATA_HOST}/suggest/${directOp}`;
  const direct = await fetch(directUrl, {
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