import { requireAdminPage } from "@/lib/admin-auth";
import { getDirectory } from "@/lib/admin-data";
import { createAdminClient } from "@/lib/supabase/admin";
import ExportButton from "@/components/admin/ExportButton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/Table";

const fmt = (s?: string | null) =>
  s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

const money = (amount: number, currency: string) =>
  currency === "RUB"
    ? `${(amount / 100).toLocaleString("ru-RU")} ₽`
    : `${(amount / 100).toLocaleString("ru-RU")} ${currency}`;

type PaymentRow = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  provider: string;
  provider_id: string | null;
  status: string;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdminPage("admin");
  const sp = await searchParams;
  const status = sp.status ?? "";
  const q = (sp.q ?? "").trim().toLowerCase();

  const admin = createAdminClient();
  const { emailById } = await getDirectory();
  const { data: pays } = await admin
    .from("payments")
    .select("id, user_id, amount, currency, provider, provider_id, status, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  const filtered = (pays ?? []).filter(
    (p: PaymentRow) =>
      (!status || p.status === status) &&
      (!q || (emailById.get(p.user_id) ?? "").toLowerCase().includes(q))
  );

  const statusOptions = [
    { value: "", label: "Все статусы" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "canceled", label: "Canceled" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Платежи</h1>
        <ExportButton type="payments" />
      </div>

      <form method="get" className="flex items-end gap-3 flex-wrap">
        <Select label="Статус" name="status" options={statusOptions} defaultValue={status} className="w-56" />
        <Input name="q" defaultValue={sp.q ?? ""} placeholder="Поиск по email" className="w-72" />
        <Button type="submit" variant="secondary">Фильтр</Button>
        <a href="/admin/payments" className="text-sm text-gray-600 hover:underline self-center">Сброс</a>
      </form>

      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Пользователь</TableHeader>
              <TableHeader>Сумма</TableHeader>
              <TableHeader>Провайдер</TableHeader>
              <TableHeader>Статус</TableHeader>
              <TableHeader>ID провайдера</TableHeader>
              <TableHeader>Дата</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p: PaymentRow) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-gray-900">{emailById.get(p.user_id) || p.user_id}</TableCell>
                <TableCell className="font-semibold">{money(p.amount, p.currency)}</TableCell>
                <TableCell className="capitalize text-gray-600">{p.provider}</TableCell>
                <TableCell>
                  <Badge
                    variant={p.status === "paid" ? "green" : p.status === "failed" ? "red" : p.status === "refunded" ? "purple" : "amber"}
                    size="sm"
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-600 font-mono">{p.provider_id || "—"}</TableCell>
                <TableCell className="text-gray-600">{fmt(p.created_at)}</TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-600 py-10">
                  Платежи не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
