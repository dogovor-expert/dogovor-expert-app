"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileText,
  GitCompare,
  Loader2,
  Printer,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import {
  buildDiffReport,
  type DiffBlock,
  type DiffReport,
  type DiffSegment,
} from "@/lib/diff";
import { extractDocText, isSupportedDocFile } from "@/lib/docText";
import { exportToDocxHtml } from "@/lib/exportDocx";
import {
  EMPTY_PROTOCOL_META,
  buildProtocolRows,
  protocolFilename,
  protocolHtml,
  protocolTitle,
  type Protocol,
  type ProtocolMeta,
  type ProtocolRow,
} from "@/lib/protocol";
import ProtocolPrint from "./ProtocolPrint";

type Filter = "all" | "changed" | "added" | "removed";

const todayRu = () => new Date().toLocaleDateString("ru-RU");

const KIND_BADGE: Record<
  DiffBlock["kind"],
  { label: string; className: string }
> = {
  unchanged: { label: "Без изменений", className: "bg-gray-100 text-gray-600" },
  added: { label: "Добавлено", className: "bg-emerald-100 text-emerald-800" },
  removed: { label: "Удалено", className: "bg-red-100 text-red-700" },
  changed: { label: "Изменено", className: "bg-amber-100 text-amber-800" },
};

const INPUT =
  "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none";

/** Подсветка пословного диффа: удалённое — красным, добавленное — зелёным. */
function WordDiff({ segments }: { segments: DiffSegment[] }) {
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
      {segments.map((s, i) =>
        s.op === "equal" ? (
          <span key={i}>{s.text}</span>
        ) : s.op === "delete" ? (
          <span
            key={i}
            className="bg-red-100 text-red-700 line-through decoration-red-400"
          >
            {s.text}
          </span>
        ) : (
          <span key={i} className="bg-emerald-100 text-emerald-800">
            {s.text}
          </span>
        )
      )}
    </p>
  );
}

function Editor({
  title,
  text,
  busy,
  onChange,
  onFile,
}: {
  title: string;
  text: string;
  busy: boolean;
  onChange: (v: string) => void;
  onFile: (f: File) => void;
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-soft p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
          <FileText className="w-4 h-4 text-brand-600" />
          {title}
        </p>
        {text.trim().length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Очистить
          </button>
        )}
      </div>
      <label className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-brand-100">
        <Upload className="w-3.5 h-3.5" />
        Загрузить файл
        <input
          type="file"
          accept=".docx,.pdf,.txt,.md,.rtf"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </label>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…или вставьте текст договора"
        aria-label="Текст договора для сравнения"
        rows={10}
        className="mt-3 w-full rounded-xl border border-gray-200 p-3 text-xs leading-relaxed focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-y"
      />
      <p className="mt-1 text-[11px] text-gray-500">
        {text.trim().length} символов
      </p>
    </div>
  );
}

/**
 * Интерактив «Сравнение редакций + протокол разногласий».
 * Всё считается в браузере: файлы и текст не покидают устройство.
 */
export default function DocCompare() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [report, setReport] = useState<DiffReport | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ProtocolRow[]>([]);
  const [meta, setMeta] = useState<ProtocolMeta>({
    ...EMPTY_PROTOCOL_META,
    date: todayRu(),
  });
  const printRef = useRef<HTMLDivElement>(null);

  const print = useReactToPrint({
    contentRef: printRef,
    documentTitle: protocolTitle(meta),
    pageStyle: "@page { size: A4; margin: 15mm }",
  });

  const loadFile = async (which: "a" | "b", file: File) => {
    setError(null);
    if (!isSupportedDocFile(file)) {
      setError(
        "Поддерживаются DOCX, PDF, TXT, MD. Скан сначала распознайте в конвертере документов."
      );
      return;
    }
    setBusy(true);
    try {
      const text = await extractDocText(file);
      if (!text.trim()) {
        setError(
          "Не удалось извлечь текст: возможно, это скан без текстового слоя."
        );
      }
      if (which === "a") setTextA(text);
      else setTextB(text);
    } catch (e) {
      setError((e as Error).message || "Не удалось прочитать файл");
    } finally {
      setBusy(false);
    }
  };

  const compare = () => {
    setError(null);
    const r = buildDiffReport(textA, textB);
    setReport(r);
    setRows(buildProtocolRows(r.changes));
    setFilter("all");
  };

  const protocol: Protocol = useMemo(() => ({ meta, rows }), [meta, rows]);

  const visibleBlocks = useMemo(() => {
    if (!report) return [];
    if (filter === "all") return report.blocks;
    return report.blocks.filter((b) => b.kind === filter);
  }, [report, filter]);

  const updateRow = (i: number, patch: Partial<ProtocolRow>) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    );

  const downloadDocx = async () => {
    try {
      await exportToDocxHtml(protocolHtml(protocol), protocolFilename(meta));
    } catch {
      setError("Не удалось сформировать DOCX");
    }
  };

  const canCompare =
    textA.trim().length > 0 && textB.trim().length > 0 && !busy;

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-2.5 py-1.5">
        <ShieldCheck className="w-3.5 h-3.5" />
        Документы обрабатываются в браузере и не отправляются на сервер
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Editor
          title="Редакция 1 (ваша)"
          text={textA}
          busy={busy}
          onChange={setTextA}
          onFile={(f) => {
            void loadFile("a", f);
          }}
        />
        <Editor
          title="Редакция 2 (контрагента)"
          text={textB}
          busy={busy}
          onChange={setTextB}
          onFile={(f) => {
            void loadFile("b", f);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={compare}
          disabled={!canCompare}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <GitCompare className="w-4 h-4" />
          )}
          Сравнить редакции
        </button>
        {report && (
          <p className="text-xs text-gray-500">
            Проверено пунктов: {report.stats.total} · изменений:{" "}
            {report.changes.length}
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">
          {error}
        </p>
      )}

      {report && (
        <section className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", `Все пункты (${report.stats.total})`],
                ["changed", `Изменённые (${report.stats.changed})`],
                ["added", `Добавленные (${report.stats.added})`],
                ["removed", `Удалённые (${report.stats.removed})`],
              ] as [Filter, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-lg border text-xs font-semibold px-2.5 py-1.5 transition-colors ${
                  filter === key
                    ? "bg-brand-600 border-brand-600 text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:border-brand-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {report.changes.length === 0 ? (
            <p className="rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-sm px-3 py-3">
              Различий не найдено — редакции совпадают.
            </p>
          ) : (
            <ul className="space-y-3">
              {visibleBlocks.map((b, i) => (
                <li
                  key={`${b.kind}-${b.aIndex ?? "n"}-${b.bIndex ?? "n"}-${i}`}
                  className="rounded-2xl bg-white border border-gray-200 shadow-soft p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 ${KIND_BADGE[b.kind].className}`}
                    >
                      {KIND_BADGE[b.kind].label}
                    </span>
                    {(b.a || b.b) && (
                      <span className="text-[11px] text-gray-500">
                        пункт{" "}
                        {b.aIndex !== null
                          ? b.aIndex + 1
                          : (b.bIndex ?? 0) + 1}
                      </span>
                    )}
                  </div>

                  {b.kind === "changed" && b.segments && (
                    <div className="mt-3">
                      <WordDiff segments={b.segments} />
                    </div>
                  )}

                  {b.kind !== "changed" && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                      {b.a || b.b}
                    </p>
                  )}

                  {b.kind === "changed" && (
                    <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                        <p className="font-semibold text-gray-500 mb-1">
                          Редакция 1
                        </p>
                        <p className="whitespace-pre-wrap text-gray-800">{b.a}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                        <p className="font-semibold text-gray-500 mb-1">
                          Редакция 2
                        </p>
                        <p className="whitespace-pre-wrap text-gray-800">{b.b}</p>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {report && rows.length > 0 && (
        <section className="space-y-4">
          <div className="border-t border-gray-200 pt-6">
            <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-brand-600">
              Шаг 2
            </p>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 mt-1">
              Протокол разногласий
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Заполните реквизиты и согласуйте формулировки — документ соберётся
              автоматически.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(
              [
                ["city", "Город"],
                ["date", "Дата протокола"],
                ["contractKind", "Тип договора (напр. «поставки»)"],
                ["contractNumber", "Номер договора"],
                ["contractDate", "Дата договора"],
                ["party1", "Сторона 1"],
                ["party2", "Сторона 2"],
              ] as [keyof ProtocolMeta, string][]
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-xs font-semibold text-gray-600">
                  {label}
                </span>
                <input
                  className={`${INPUT} mt-1`}
                  value={meta[key]}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, [key]: e.target.value }))
                  }
                />
              </label>
            ))}
          </div>

          <div className="space-y-3">
            {rows.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-gray-200 shadow-soft p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    Пункт {r.clause || "—"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateRow(i, { agreed: r.ours })}
                      className="rounded-lg border border-gray-200 bg-white text-xs px-2 py-1 hover:border-brand-300"
                    >
                      Взять ред. 1
                    </button>
                    <button
                      type="button"
                      onClick={() => updateRow(i, { agreed: r.theirs })}
                      className="rounded-lg border border-gray-200 bg-white text-xs px-2 py-1 hover:border-brand-300"
                    >
                      Взять ред. 2
                    </button>
                    <button
                      type="button"
                      onClick={() => updateRow(i, { agreed: "" })}
                      className="rounded-lg border border-gray-200 bg-white text-xs px-2 py-1 hover:border-brand-300"
                    >
                      Исключить
                    </button>
                    <label className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={r.critical}
                        onChange={(e) =>
                          updateRow(i, { critical: e.target.checked })
                        }
                        className="rounded border-gray-300"
                      />
                      Принципиальное
                    </label>
                  </div>
                </div>
                <textarea
                  value={r.agreed}
                  onChange={(e) => updateRow(i, { agreed: e.target.value })}
                  rows={2}
                  placeholder="Согласованная редакция (пусто = исключить пункт)"
                  className="mt-2 w-full rounded-xl border border-gray-200 p-2.5 text-xs leading-relaxed focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-y"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                void downloadDocx();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5"
            >
              <Download className="w-4 h-4" />
              Скачать DOCX
            </button>
            <button
              type="button"
              onClick={() => print()}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 hover:border-brand-300 text-gray-800 text-sm font-semibold px-4 py-2.5"
            >
              <Printer className="w-4 h-4" />
              Печать / PDF
            </button>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-px" />
            <p>
              Протокол носит справочный характер. Проверьте формулировки и
              реквизиты перед подписанием; при существенных разногласиях
              рекомендуем юридическую консультацию.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div ref={printRef} className="min-w-[720px]">
              <ProtocolPrint protocol={protocol} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
