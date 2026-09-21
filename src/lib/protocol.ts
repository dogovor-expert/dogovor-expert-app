/**
 * «Протокол разногласий» — модель документа и генерация HTML для экспорта.
 *
 * Юридическая природа: ответ о согласии заключить договор на иных условиях
 * (ст. 443 ГК РФ) — не является акцептом, но сам является офертой. Протокол
 * разногласий фиксирует расхождения по пунктам и согласованные формулировки,
 * после чего становится неотъемлемой частью договора.
 *
 * HTML собирается здесь, а DOCX/PDF делает существующий пайплайн
 * (`exportToDocxHtml`) — единый дизайн документов сайта.
 */
import { clauseNumber, type DiffBlock } from "@/lib/diff";

export interface ProtocolMeta {
  /** Город составления. */
  city: string;
  /** Дата протокола (как вводит пользователь). */
  date: string;
  /** Тип договора в родительном падеже, напр. «поставки», «оказания услуг». */
  contractKind: string;
  contractNumber: string;
  contractDate: string;
  /** Сторона 1 (обычно заказчик/покупатель). */
  party1: string;
  /** Сторона 2 (исполнитель/поставщик). */
  party2: string;
}

export interface ProtocolRow {
  /** Номер пункта договора (может быть пустым). */
  clause: string;
  /** Редакция стороны 1. */
  ours: string;
  /** Редакция стороны 2. */
  theirs: string;
  /** Согласованная редакция (пусто = «исключить пункт»). */
  agreed: string;
  /** Отметка «принципиальное разногласие». */
  critical: boolean;
}

export interface Protocol {
  meta: ProtocolMeta;
  rows: ProtocolRow[];
}

export const EMPTY_PROTOCOL_META: ProtocolMeta = {
  city: "",
  date: "",
  contractKind: "",
  contractNumber: "",
  contractDate: "",
  party1: "",
  party2: "",
};

/**
 * Строит строки протокола из изменённых блоков диффа.
 * По умолчанию предлагаем свою редакцию (редакция 1), для добавленных
 * контрагентом пунктов — «исключить», удалённые помечаем как критичные.
 */
export function buildProtocolRows(
  changes: readonly DiffBlock[]
): ProtocolRow[] {
  return changes.map((c) => ({
    clause: clauseNumber(c.a || c.b) ?? "",
    ours: c.a,
    theirs: c.b,
    agreed: c.kind === "added" ? "" : c.a,
    critical: c.kind === "removed",
  }));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nl2br(s: string): string {
  return escapeHtml(s).replace(/\n/g, "<br>");
}

/** Заголовок протокола: «Протокол разногласий к Договору поставки № 5». */
export function protocolTitle(meta: ProtocolMeta): string {
  const kind = meta.contractKind.trim();
  const num = meta.contractNumber.trim();
  return `Протокол разногласий к договору${kind ? ` ${kind}` : ""}${
    num ? ` № ${num}` : ""
  }`;
}

/** Транслитерация для безопасных имён файлов (ASCII). */
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Имя файла без расширения. */
export function protocolFilename(meta: ProtocolMeta): string {
  const parts = ["protokol-raznoglasij"];
  const num = meta.contractNumber.trim();
  if (num) parts.push(slugify(num));
  const kind = slugify(meta.contractKind.trim());
  if (kind) parts.push(kind);
  return parts.join("-");
}

/** HTML-документ протокола (для exportToDocxHtml и печати/PDF). */
export function protocolHtml(p: Protocol): string {
  const { meta, rows } = p;
  const p1 = meta.party1.trim() || "Сторона 1";
  const p2 = meta.party2.trim() || "Сторона 2";

  const head = [
    `<h1 style="text-align:center">ПРОТОКОЛ РАЗНОГЛАСИЙ</h1>`,
    `<p style="text-align:center">к договору${
      meta.contractKind.trim() ? ` ${escapeHtml(meta.contractKind.trim())}` : ""
    }${
      meta.contractNumber.trim()
        ? ` № ${escapeHtml(meta.contractNumber.trim())}`
        : ""
    }${
      meta.contractDate.trim()
        ? ` от ${escapeHtml(meta.contractDate.trim())}`
        : ""
    }</p>`,
    `<p>${[meta.city.trim(), meta.date.trim()]
      .filter(Boolean)
      .map(escapeHtml)
      .join(", ")}</p>`,
  ].join("\n");

  const preamble = `<p>${escapeHtml(
    p1
  )} и ${escapeHtml(
    p2
  )}, совместно именуемые «Стороны», при заключении договора не пришли к соглашению по отдельным условиям и составили настоящий протокол разногласий о нижеследующем:</p>`;

  const header = `<tr>
    <th style="width:8%">№</th>
    <th style="width:12%">Пункт</th>
    <th style="width:27%">Редакция: ${escapeHtml(p1)}</th>
    <th style="width:27%">Редакция: ${escapeHtml(p2)}</th>
    <th style="width:26%">Согласованная редакция</th>
  </tr>`;

  const body = rows
    .map((r, i) => {
      const agreed = r.agreed.trim()
        ? nl2br(r.agreed)
        : "<em>Пункт исключить</em>";
      return `<tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(r.clause || "—")}</td>
        <td>${r.ours.trim() ? nl2br(r.ours) : "<em>—</em>"}</td>
        <td>${r.theirs.trim() ? nl2br(r.theirs) : "<em>—</em>"}</td>
        <td>${agreed}${r.critical ? " <strong>(принципиальное разногласие)</strong>" : ""}</td>
      </tr>`;
    })
    .join("\n");

  const closing = `<p>Настоящий протокол разногласий является неотъемлемой частью указанного договора. Согласованные в нём условия применяются с даты подписания договора, а при отсутствии согласия — спор передаётся на рассмотрение суда в порядке, установленном законодательством Российской Федерации (ст. 443, 445 ГК РФ).</p>`;

  const signatures = `<p>Подписи Сторон:</p>
    <table style="width:100%;border:none">
      <tr>
        <td style="border:none;width:50%">${escapeHtml(p1)}<br><br>_______________ / ______________</td>
        <td style="border:none;width:50%">${escapeHtml(p2)}<br><br>_______________ / ______________</td>
      </tr>
    </table>`;

  return [
    head,
    preamble,
    `<table>${header}${body}</table>`,
    closing,
    signatures,
  ].join("\n");
}
