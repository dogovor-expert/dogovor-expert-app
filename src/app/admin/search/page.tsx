import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const fmt = (s?: string | null) =>
  s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";

export const dynamic = "force-dynamic";

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdminPage();
  const { q: raw } = await searchParams;
  const q = (raw ?? "").trim();
  const safe = q.replace(/[^a-zA-Zа-яА-ЯёЁ0-9@.\s-]/g, "");
  const sb = createAdminClient();

  let users: any[] = [];
  let feedback: any[] = [];
  let leads: any[] = [];
  let payments: any[] = [];

  if (q.length >= 2) {
    const like = `%${safe}%`;
    const [{ data: u }, { data: f }, { data: l }, { data: p }] = await Promise.all([
      sb.from("profiles").select("id, full_name, company, inn").or(`full_name.ilike.${like},company.ilike.${like},inn.ilike.${like}`).limit(20),
      sb.from("feedback").select("id, ticket_no, type, email, message, status, created_at").or(`email.ilike.${like},message.ilike.${like},ticket_no.ilike.${like}`).limit(20),
      sb.from("leads").select("id, service, brand, vin, phone, status, created_at").or(`brand.ilike.${like},vin.ilike.${like},phone.ilike.${like}`).limit(20),
      sb.from("payments").select("id, user_id, amount, currency, provider, status, created_at").or(`provider_id.ilike.${like},provider.ilike.${like}`).limit(20),
    ]);
    users = u || [];
    feedback = f || [];
    leads = l || [];
    payments = p || [];
  }

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
          Запрос: <b>{q || "—"}</b> (минимум 2 символа). Ищет по пользователям, обращениям, лидам и платежам.
        </p>
      </div>

      {q.length < 2 ? (
        <p className="text-sm text-gray-600">Введите запрос в строку поиска сверху.</p>
      ) : (
        <div className="space-y-4">
          <Section title="Пользователи" count={users.length}>
            <ul className="text-sm divide-y divide-gray-100">
              {users.map((u) => (
                <li key={u.id} className="py-2">
                  <Link href={`/admin/users/${u.id}`} className="text-brand-700 hover:underline font-medium">
                    {u.full_name || "—"}
                  </Link>
                  <span className="text-gray-600"> · {u.company || ""} {u.inn ? `ИНН ${u.inn}` : ""}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Обращения" count={feedback.length}>
            <ul className="text-sm divide-y divide-gray-100">
              {feedback.map((f) => (
                <li key={f.id} className="py-2 text-gray-700">
                  <span className="font-medium">{f.ticket_no}</span> · {f.email} · {f.message?.slice(0, 80)}
                  <span className="text-gray-600"> · {fmt(f.created_at)}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Лиды" count={leads.length}>
            <ul className="text-sm divide-y divide-gray-100">
              {leads.map((l) => (
                <li key={l.id} className="py-2 text-gray-700">
                  {l.service} · {l.brand} {l.vin ? `· ${l.vin}` : ""} · {l.phone}
                  <span className="text-gray-600"> · {fmt(l.created_at)}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Платежи" count={payments.length}>
            <ul className="text-sm divide-y divide-gray-100">
              {payments.map((p) => (
                <li key={p.id} className="py-2 text-gray-700">
                  {p.provider} · {(p.amount / 100).toLocaleString("ru-RU")} {p.currency} · {p.status}
                  <Link href={`/admin/users/${p.user_id}`} className="text-brand-700 hover:underline ml-2">пользователь</Link>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}
    </div>
  );
}
