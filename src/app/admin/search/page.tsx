"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, Loader2 } from "lucide-react";

const fmt = (s?: string | null) =>
  s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";

type Result = {
  q: string;
  users: { id: string; full_name: string | null; company: string | null; inn: string | null }[];
  feedback: { id: string; ticket_no: string | null; type: string; email: string; message: string | null; status: string; created_at: string }[];
  leads: { id: string; service: string; brand: string; vin: string | null; phone: string | null; status: string; created_at: string }[];
  payments: { id: string; user_id: string; amount: number; currency: string; provider: string; status: string; created_at: string }[];
};

export default function AdminSearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_search_q");
    if (stored) {
      sessionStorage.removeItem("admin_search_q");
      setQuery(stored);
      void runSearch(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSearch = async (explicit?: string) => {
    const q = (explicit ?? query).trim();
    if (q.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Ошибка поиска");
      }
      setResult(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка поиска");
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
    <Card padding="md">
      <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        {title} <Badge variant="gray" size="sm">{count}</Badge>
      </h2>
      {count ? children : <p className="text-sm text-gray-600">Ничего не найдено</p>}
    </Card>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Глобальный поиск</h1>
        <p className="text-gray-600 text-sm">
          Ищет по пользователям, обращениям, лидам и платежам. Запрос не сохраняется в адресной строке.
        </p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void runSearch();
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Email, ФИО, ИНН, номер тикета, VIN… (минимум 2 символа)"
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          maxLength={120}
        />
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-60 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Найти
        </button>
      </form>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {result && (
        <>
          <p className="text-gray-600 text-sm">
            Запрос: <b>{result.q}</b>
          </p>
          <div className="space-y-4">
            <Section title="Пользователи" count={result.users.length}>
              <ul className="text-sm divide-y divide-gray-100">
                {result.users.map((u) => (
                  <li key={u.id} className="py-2">
                    <Link href={`/admin/users/${u.id}`} className="text-brand-700 hover:underline font-medium">
                      {u.full_name || "—"}
                    </Link>
                    <span className="text-gray-600"> · {u.company || ""} {u.inn ? `ИНН ${u.inn}` : ""}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Обращения" count={result.feedback.length}>
              <ul className="text-sm divide-y divide-gray-100">
                {result.feedback.map((f) => (
                  <li key={f.id} className="py-2 text-gray-700">
                    <span className="font-medium">{f.ticket_no}</span> · {f.email} · {f.message?.slice(0, 80)}
                    <span className="text-gray-600"> · {fmt(f.created_at)}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Лиды" count={result.leads.length}>
              <ul className="text-sm divide-y divide-gray-100">
                {result.leads.map((l) => (
                  <li key={l.id} className="py-2 text-gray-700">
                    {l.service} · {l.brand} {l.vin ? `· ${l.vin}` : ""} · {l.phone}
                    <span className="text-gray-600"> · {fmt(l.created_at)}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Платежи" count={result.payments.length}>
              <ul className="text-sm divide-y divide-gray-100">
                {result.payments.map((p) => (
                  <li key={p.id} className="py-2 text-gray-700">
                    {p.provider} · {(p.amount / 100).toLocaleString("ru-RU")} {p.currency} · {p.status}
                    <Link href={`/admin/users/${p.user_id}`} className="text-brand-700 hover:underline ml-2">пользователь</Link>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </>
      )}
    </div>
  );
}