import { NextResponse } from "next/server";
import { LEGAL_TEMPLATES } from "@/data/templates";

// Лёгкий список шаблонов для автодополнения в форме обратной связи.
// Возвращает только id/name/category — без тяжёлых тел шаблонов,
// чтобы не тянуть всю базу шаблонов в клиентский бандл.
export async function GET() {
  const summary = LEGAL_TEMPLATES.map((t) => ({ id: t.id, name: t.name, category: t.category }));
  return NextResponse.json({ data: summary });
}
