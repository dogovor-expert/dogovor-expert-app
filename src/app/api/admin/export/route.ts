import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDirectory } from "@/lib/admin-data";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // Prevent CSV formula injection: prefix with ' if starts with = + - @
  const hasFormulaPrefix = /^[=+\-@]/.test(s);
  const needsQuotes = /[",\n;]/.test(s);
  let result = s;
  if (hasFormulaPrefix) result = "'" + result;
  if (needsQuotes) result = `"${result.replace(/"/g, '""')}"`;
  return result;
}

function toCsv(rows: Record<string, unknown>[], headers: string[], keys: string[]): string {
  const head = headers.map(csvEscape).join(",");
  const body = rows
    .map((r) => keys.map((k) => csvEscape((r as any)[k])).join(","))
    .join("\n");
  return `${head}\n${body}`;
}

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const type = new URL(req.url).searchParams.get("type");
  const sb = createAdminClient();
  let csv = "";
  let filename = "export.csv";

  if (type === "users") {
    const { users } = await getDirectory();
    const rows = users.map((u) => ({
      email: u.email,
      full_name: u.full_name,
      company: u.company,
      inn: u.inn,
      phone: u.phone,
      is_admin: u.is_admin,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    }));
    csv = toCsv(
      rows,
      ["email", "full_name", "company", "inn", "phone", "is_admin", "created_at", "last_sign_in_at"],
      ["email", "full_name", "company", "inn", "phone", "is_admin", "created_at", "last_sign_in_at"]
    );
    filename = "users.csv";
  } else if (type === "payments") {
    const { data } = await sb.from("payments").select("*").order("created_at", { ascending: false });
    const rows = (data || []).map((p: any) => ({
      user_id: p.user_id,
      amount_minor: p.amount,
      amount_major: p.currency === "RUB" ? Number(p.amount) / 100 : p.amount,
      currency: p.currency,
      provider: p.provider,
      provider_id: p.provider_id,
      status: p.status,
      created_at: p.created_at,
    }));
    csv = toCsv(
      rows,
      ["user_id", "amount_minor", "amount_major", "currency", "provider", "provider_id", "status", "created_at"],
      ["user_id", "amount_minor", "amount_major", "currency", "provider", "provider_id", "status", "created_at"]
    );
    filename = "payments.csv";
  } else if (type === "subscriptions") {
    const { data } = await sb.from("subscriptions").select("*").order("period_end", { ascending: false });
    const rows = (data || []).map((s: any) => ({
      user_id: s.user_id,
      plan: s.plan,
      status: s.status,
      period_start: s.period_start,
      period_end: s.period_end,
      auto_renewal: s.auto_renewal,
      created_at: s.created_at,
    }));
    csv = toCsv(
      rows,
      ["user_id", "plan", "status", "period_start", "period_end", "auto_renewal", "created_at"],
      ["user_id", "plan", "status", "period_start", "period_end", "auto_renewal", "created_at"]
    );
    filename = "subscriptions.csv";
  } else if (type === "feedback") {
    const { data } = await sb.from("feedback").select("*").order("created_at", { ascending: false });
    const rows = (data || []).map((f: any) => ({
      ticket_no: f.ticket_no,
      type: f.type,
      doc_name: f.doc_name,
      tool: f.tool,
      email: f.email,
      message: f.message,
      status: f.status,
      created_at: f.created_at,
    }));
    csv = toCsv(
      rows,
      ["ticket_no", "type", "doc_name", "tool", "email", "message", "status", "created_at"],
      ["ticket_no", "type", "doc_name", "tool", "email", "message", "status", "created_at"]
    );
    filename = "feedback.csv";
  } else {
    return NextResponse.json({ error: "bad type" }, { status: 400 });
  }

  return new NextResponse("﻿" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
