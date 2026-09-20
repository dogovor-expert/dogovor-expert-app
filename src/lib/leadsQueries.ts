import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Сводка заявок (таблица leads) для аналитики: всего, за период, по услуге и
 * по статусу. Услуги: docs/full — растаможка, epts — выписка ЭПТС, kasko — КАСКО.
 */

export interface CountItem {
  label: string;
  count: number;
}

export interface LeadsSummary {
  total: number;
  last: number;
  byService: CountItem[];
  byStatus: CountItem[];
}

const SERVICE_LABELS: Record<string, string> = {
  docs: "Растаможка",
  full: "Растаможка (полная)",
  epts: "Выписка ЭПТС",
  kasko: "КАСКО",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  paid: "Оплачена",
  docs: "Документы готовы",
  filed: "Подано",
  done: "Завершена",
  canceled: "Отменена",
};

export async function getLeadsSummary(days = 30): Promise<LeadsSummary> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await admin.from("leads").select("service,status,created_at").limit(5000);

  const rows = (data ?? []) as { service: string | null; status: string | null; created_at: string }[];
  const svc = new Map<string, number>();
  const st = new Map<string, number>();
  let last = 0;

  for (const r of rows) {
    const s = r.service ?? "docs";
    svc.set(s, (svc.get(s) ?? 0) + 1);
    const s2 = r.status ?? "new";
    st.set(s2, (st.get(s2) ?? 0) + 1);
    if (r.created_at >= since) last += 1;
  }

  return {
    total: rows.length,
    last,
    byService: [...svc.entries()]
      .map(([k, c]) => ({ label: SERVICE_LABELS[k] ?? k, count: c }))
      .sort((a, b) => b.count - a.count),
    byStatus: [...st.entries()]
      .map(([k, c]) => ({ label: STATUS_LABELS[k] ?? k, count: c }))
      .sort((a, b) => b.count - a.count),
  };
}
