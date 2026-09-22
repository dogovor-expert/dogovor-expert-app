"use client";
import { useMemo, useState } from "react";
import { Download, FileText, Loader2, Plus, Printer, Trash2 } from "lucide-react";
import { parseMoney, rublesToWords } from "@/lib/words";
import { escapeHtml } from "@/lib/utils";

type OpRow = {
  id: number;
  date: string;
  doc: string;
  debit: string;
  credit: string;
};

interface ReconciliationForm {
  org1: string;
  org2: string;
  contractNo: string;
  contractDate: string;
  periodFrom: string;
  periodTo: string;
  startSaldo: string;
}

const EMPTY_ROW: Omit<OpRow, "id"> = { date: "", doc: "", debit: "", credit: "" };

const moneyOrZero = (v: string): number => parseMoney(v)?.rub ?? 0;

function fmtMoney(v: number): string {
  return v.toLocaleString("ru-RU"); // 1 234 567
}

/** JSON-ячейка для таблицы экспорта. */
function td(v: string, bold?: boolean, center = false): string {
  const style = [
    "border:1px solid #999",
    bold ? "font-weight:bold" : "",
    center ? "text-align:center" : "text-align:left",
    "padding:4px 8px",
  ]
    .filter(Boolean)
    .join(";");
  return `<td style="${style}">${v}</td>`;
}

function buildAktHtml(f: ReconciliationForm, rows: OpRow[]): string {
  const o1 = f.org1.trim() || "Сторона 1";
  const o2 = f.org2.trim() || "Сторона 2";
  const startKop = parseMoney(f.startSaldo);
  const saldoStart = startKop ? startKop.rub : 0;
  const totalDebit = rows.reduce((s, r) => s + moneyOrZero(r.debit), 0);
  const totalCredit = rows.reduce((s, r) => s + moneyOrZero(r.credit), 0);
  const saldoEnd = saldoStart + totalDebit - totalCredit;
  const saldoWords = rublesToWords(String(saldoEnd)) ?? "";

  const head = [
    `<p style="text-align:center;font-weight:bold;font-size:13pt">АКТ СВЕРКИ ВЗАИМНЫХ РАСЧЁТОВ</p>`,
    `<p style="text-align:center">по договору № ${escapeHtml(f.contractNo || "—")} от «${escapeHtml(f.contractDate || "____")}»</p>`,
    `<p style="text-align:center">за период: ${escapeHtml(f.periodFrom || "—")} — ${escapeHtml(f.periodTo || "—")}</p>`,
    `<p>${escapeHtml(o1)}, именуемое в дальнейшем «Сторона 1», и ${escapeHtml(o2)}, именуемое в дальнейшем «Сторона 2», настоящим Актом подтверждают:</p>`,
  ].join("\n");

  const headerRow = `<tr>
    ${td("№", true, true)}
    ${td("Дата", true, true)}
    ${td("Основание (документ)", true, true)}
    ${td("Дебет, руб.", true, true)}
    ${td("Кредит, руб.", true, true)}
    ${td("Приращение сальдо, руб.", true, true)}
  </tr>`;

  const bodyRows = rows.map((r, i) => {
    const d = moneyOrZero(r.debit);
    const c = moneyOrZero(r.credit);
    const delta = d - c;
    return `<tr>
      ${td(String(i + 1), false, true)}
      ${td(escapeHtml(r.date) || "—", false, true)}
      ${td(escapeHtml(r.doc) || "—")}
      ${td(r.debit ? fmtMoney(d) : "—", false, true)}
      ${td(r.credit ? fmtMoney(c) : "—", false, true)}
      ${td(delta !== 0 ? `${delta > 0 ? "+" : ""}${fmtMoney(delta)}` : "—", d !== c, true)}
    </tr>`;
  });

  const totalsRow = `<tr>
    ${td("Итого", true, true)}
    ${td("", false, true)}
    ${td("", false, true)}
    ${td(fmtMoney(totalDebit), true, true)}
    ${td(fmtMoney(totalCredit), true, true)}
    ${td(fmtMoney(saldoEnd - saldoStart), true, true)}
  </tr>`;

  const summary = [
    `<p>Сальдо на начало периода: <strong>${fmtMoney(saldoStart)}</strong> руб.</p>`,
    `<p>Обороты за период: дебет <strong>${fmtMoney(totalDebit)}</strong> руб., кредит <strong>${fmtMoney(totalCredit)}</strong> руб.</p>`,
    `<p>Сальдо на конец периода: <strong>${fmtMoney(saldoEnd)}</strong> руб.</p>`,
    saldoWords
      ? `<p>Сумма прописью: <strong>${escapeHtml(saldoWords)}</strong></p>`
      : "",
  ].join("\n");

  const signStyle = "border:none;vertical-align:top;width:50%;padding:4px 8px";
  const signatures = `<p>Подписи Сторон:</p>
    <table style="width:100%;border:none">
      <tr>
        <td style="${signStyle}">${escapeHtml(o1)}<br><br>_______________ / ________________</td>
        <td style="${signStyle}">${escapeHtml(o2)}<br><br>_______________ / ________________</td>
      </tr>
    </table>`;

  return [
    head,
    `<table style="border-collapse:collapse;width:100%">${headerRow}${bodyRows.join("")}${totalsRow}</table>`,
    summary,
    signatures,
  ].join("\n");
}

export default function Reconciliation() {
  const [form, setForm] = useState<ReconciliationForm>({
    org1: "",
    org2: "",
    contractNo: "",
    contractDate: "",
    periodFrom: "",
    periodTo: "",
    startSaldo: "0",
  });
  const [rows, setRows] = useState<OpRow[]>([{ ...EMPTY_ROW, id: 1 }]);
  const [busy, setBusy] = useState<null | "docx" | "pdf" | "print">(null);
  const [error, setError] = useState("");

  const nextId = useMemo(() => Math.max(0, ...rows.map((r) => r.id)) + 1, [rows]);

  const setField = <K extends keyof ReconciliationForm>(k: K, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const updateRow = (id: number, patch: Partial<Omit<OpRow, "id">>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW, id: nextId }]);
  const removeRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const isValid = form.org1.trim() && form.org2.trim();

  const exportDocx = async () => {
    if (!isValid) { setError("Укажите обе стороны"); return; }
    setError("");
    setBusy("docx");
    try {
      const { exportToDocxHtml } = await import("@/lib/exportDocx");
      await exportToDocxHtml(buildAktHtml(form, rows), `Акт_сверки_${form.periodTo || "период"}`, {
        design: "classic",
      });
    } catch (e) {
      console.error(e);
      setError("Не удалось сформировать DOCX");
    } finally {
      setBusy(null);
    }
  };

  const exportPdf = async () => {
    if (!isValid) { setError("Укажите обе стороны"); return; }
    setError("");
    setBusy("pdf");
    try {
      const { buildPdf } = await import("@/lib/exportPdf");
      const html = `<div class="doc-page">${buildAktHtml(form, rows)}</div>`;
      const { blob } = await buildPdf(html, { design: "classic", pageNumbers: true });
      const { saveAs } = await import("file-saver");
      saveAs(blob, `Акт_сверки_${form.periodTo || "период"}.pdf`);
    } catch {
      setError("Не удалось сформировать PDF");
    } finally {
      setBusy(null);
    }
  };

  const handlePrint = () => {
    if (!isValid) { setError("Укажите обе стороны"); return; }
    setError("");
    setBusy("print");
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) { setBusy(null); setError("Разрешите всплывающие окна для печати"); return; }
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Акт сверки</title></head><body>${buildAktHtml(form, rows)}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    setBusy(null);
  };

  const inputCls =
    "w-full bg-gray-50 border border-gray-200 text-xs py-2 px-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Сторона 1 (название, ИНН)</label>
          <input value={form.org1} onChange={(e) => setField("org1", e.target.value)} className={inputCls} placeholder="ООО «Ромашка»" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Сторона 2 (название, ИНН)</label>
          <input value={form.org2} onChange={(e) => setField("org2", e.target.value)} className={inputCls} placeholder="ООО «Василёк»" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Договор №</label>
          <input value={form.contractNo} onChange={(e) => setField("contractNo", e.target.value)} className={inputCls} placeholder="123/25" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Дата договора</label>
            <input type="date" value={form.contractDate} onChange={(e) => setField("contractDate", e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-600">Сальдо на начало, ₽</label>
            <input value={form.startSaldo} onChange={(e) => setField("startSaldo", e.target.value)} className={inputCls} placeholder="0" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Период: с</label>
          <input type="date" value={form.periodFrom} onChange={(e) => setField("periodFrom", e.target.value)} className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-gray-600">Период: по</label>
          <input type="date" value={form.periodTo} onChange={(e) => setField("periodTo", e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">Операции</p>
        <button type="button" onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 transition cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Добавить
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[10.5px] uppercase tracking-wide text-gray-500">
              <th className="px-3 py-2 w-8"></th>
              <th className="px-3 py-2 w-32">Дата</th>
              <th className="px-3 py-2">Основание (документ)</th>
              <th className="px-3 py-2 w-28 text-right">Дебет</th>
              <th className="px-3 py-2 w-28 text-right">Кредит</th>
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0">
                <td className="px-2 py-1.5 text-gray-400 font-mono">{rows.indexOf(r) + 1}</td>
                <td className="px-2 py-1.5">
                  <input type="date" value={r.date} onChange={(e) => updateRow(r.id, { date: e.target.value })} className={`${inputCls} !py-1.5`} />
                </td>
                <td className="px-2 py-1.5">
                  <input value={r.doc} onChange={(e) => updateRow(r.id, { doc: e.target.value })} className={`${inputCls} !py-1.5`} placeholder="Акт № 5 от 01.06.2026" />
                </td>
                <td className="px-2 py-1.5">
                  <input value={r.debit} onChange={(e) => updateRow(r.id, { debit: e.target.value })} className={`${inputCls} !py-1.5 text-right`} placeholder="0" inputMode="numeric" />
                </td>
                <td className="px-2 py-1.5">
                  <input value={r.credit} onChange={(e) => updateRow(r.id, { credit: e.target.value })} className={`${inputCls} !py-1.5 text-right`} placeholder="0" inputMode="numeric" />
                </td>
                <td className="px-2 py-1.5">
                  <button type="button" onClick={() => removeRow(r.id)} disabled={rows.length === 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{error}</p>}

      <div className="grid sm:grid-cols-3 gap-2.5">
        <button type="button" onClick={() => void exportDocx()} disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 transition cursor-pointer">
          {busy === "docx" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Скачать DOCX
        </button>
        <button type="button" onClick={() => void exportPdf()} disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 transition cursor-pointer">
          {busy === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Скачать PDF
        </button>
        <button type="button" onClick={() => void handlePrint()} disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-xs font-bold px-4 py-2.5 transition cursor-pointer">
          <Printer className="w-4 h-4" /> Печать
        </button>
      </div>

      <p className="text-[11px] text-gray-500 leading-relaxed">
        Итоговое сальдо считается нарастающим итогом автоматически. Акт сверки — не первичный документ, а
        сводный инструмент контроля взаиморасчётов; юридическую силу имеют первичные документы (акты, накладные, счета).
        Yandex-бухгалтерии и 1С используют свой формат — при необходимости сверьте итоги со своей учётной системой.
      </p>
    </div>
  );
}