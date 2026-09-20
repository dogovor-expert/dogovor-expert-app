import type { ResumeData, TemplateId } from "./types";

const IC = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  phone:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
} as const;

type IconKey = keyof typeof IC;

export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function fullName(data: ResumeData): string {
  const p = data.personal;
  return [p.surname, p.name, p.patronymic].filter(Boolean).join(" ").trim();
}

export function hardSkills(data: ResumeData): string[] {
  return data.skills.hard.concat(data.skills.tools ?? []);
}

export function countNumericBullets(data: ResumeData): number {
  let n = 0;
  data.experience.forEach((e) => (e.bullets ?? []).forEach((b) => { if (/\d/.test(b)) n += 1; }));
  return n;
}

function contactItems(data: ResumeData): Array<[IconKey, string]> {
  const p = data.personal;
  const a: Array<[IconKey, string]> = [];
  if (p.city) a.push(["pin", p.city]);
  if (p.phone) a.push(["phone", p.phone]);
  if (p.email) a.push(["mail", p.email]);
  if (p.link) a.push(["link", p.link]);
  return a;
}

function contacts(data: ResumeData): string {
  const a = contactItems(data);
  if (!a.length) return '<div class="doc-ct"><span class="empty">Добавьте контакты</span></div>';
  return `<div class="doc-ct">${a.map(([k, v]) => `<span class="cont">${IC[k]}<span>${escapeHtml(v)}</span></span>`).join("")}</div>`;
}

function contactsV(data: ResumeData): string {
  const a = contactItems(data);
  if (!a.length) return '<span class="cont">Добавьте контакты</span>';
  return a.map(([k, v]) => `<span class="cont">${IC[k]}<span>${escapeHtml(v)}</span></span>`).join("");
}

function secT(t: string): string { return `<h2 class="sec-t">${t}</h2>`; }
function sec(t: string, b: string): string { return `<section class="sec">${secT(t)}${b}</section>`; }
function tags(arr: string[]): string { return (arr ?? []).map((x) => `<span class="tag">${escapeHtml(x)}</span>`).join(""); }
function bullets(a: string[]): string {
  return a && a.length ? `<ul class="xp-b">${a.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : "";
}
function langSpans(data: ResumeData): string {
  return data.languages.map((l) => `<span>${escapeHtml(l.name)} <span class="lv">— ${escapeHtml(l.level)}</span></span>`).join("");
}
function langsInline(data: ResumeData): string { return `<div class="lg">${langSpans(data)}</div>`; }
function showPh(data: ResumeData): boolean { return Boolean(data.personal.photo && data.personal.showPhoto !== false); }
function ph(data: ResumeData, cls = ""): string {
  return showPh(data) ? `<img class="doc-ph ${cls}" src="${data.personal.photo}" alt="Фото кандидата">` : "";
}

function sumSec(data: ResumeData): string {
  return data.summary ? sec("О себе", `<p class="sum">${escapeHtml(data.summary)}</p>`) : "";
}

function expRows(data: ResumeData, v: string): string {
  return data.experience.map((e) => {
    const t = escapeHtml(e.position || "Должность");
    const c = escapeHtml(e.company || "Компания");
    const d = escapeHtml(e.period || "");
    const b = bullets(e.bullets);
    switch (v) {
      case "classic":
        return `<div class="xp-i"><div class="xp-d">${d}</div><div><div class="xp-t">${t}</div><div class="xp-c">${c}</div>${b}</div></div>`;
      case "minimal":
        return `<div class="xp-i"><div class="xp-t">${t}</div><div class="xp-d">${d}${c ? " · " + c : ""}</div>${b}</div>`;
      case "timeline":
        return `<div class="tl-i"><div class="tl-d">${d}</div><div class="tl-t">${t}</div><div class="tl-c">${c}</div>${b}</div>`;
      case "gradient":
      case "modern":
        return `<div class="xp-i"><div class="xp-top"><div class="xp-t">${t}</div><div class="xp-d">${d}</div></div><div class="xp-c">${c}</div>${b}</div>`;
      default:
        return `<div class="xp-i"><div class="xp-t">${t}</div><div class="xp-c">${c}</div><div class="xp-d">${d}</div>${b}</div>`;
    }
  }).join("");
}

function expSec(data: ResumeData, v: string): string {
  if (!data.experience.length) return "";
  const body = v === "timeline" ? `<div class="tl">${expRows(data, v)}</div>` : expRows(data, v);
  return sec("Опыт работы", body);
}

function eduRows(data: ResumeData, v: string): string {
  return data.education.map((e) => {
    const inst = escapeHtml(e.institution || "Учебное заведение");
    const line = [escapeHtml(e.field), escapeHtml(e.degree)].filter(Boolean).join(", ");
    const range = [escapeHtml(e.start), escapeHtml(e.end)].filter(Boolean).join(" — ");
    if (v === "modern" || v === "gradient") {
      return `<div class="ed-i"><div class="ed-top"><b>${inst}</b><div class="ed-m">${range}</div></div><div class="ed-m">${line}</div></div>`;
    }
    return `<div class="ed-i"><b>${inst}</b><div class="em">${line}${range ? ` <span>· ${range}</span>` : ""}</div></div>`;
  }).join("");
}

function eduSec(data: ResumeData, v: string): string {
  if (!data.education.length) return "";
  return sec("Образование", eduRows(data, v));
}

function skillsSec(data: ResumeData): string {
  let out = "";
  if (hardSkills(data).length) out += sec("Навыки", `<div class="sk">${tags(hardSkills(data))}</div>`);
  if (data.skills.soft.length) out += sec("Личные качества", `<div class="sk">${tags(data.skills.soft)}</div>`);
  return out;
}

function langsSec(data: ResumeData): string {
  return data.languages.length ? sec("Языки", langsInline(data)) : "";
}

function sideBlocks(data: ResumeData, cls: string, title: string, titleSoft: string): string {
  const hard = hardSkills(data);
  return (
    (hard.length ? `<div class="${cls}"><div class="${cls}-t">${title}</div><div class="sk">${tags(hard)}</div></div>` : "") +
    (data.skills.soft.length ? `<div class="${cls}"><div class="${cls}-t">${titleSoft}</div><div class="sk">${tags(data.skills.soft)}</div></div>` : "") +
    (data.languages.length ? `<div class="${cls}"><div class="${cls}-t">Языки</div><div class="lg">${langSpans(data)}</div></div>` : "")
  );
}

/** Собирает HTML документа резюме для выбранного шаблона. */
export function buildResumeHtml(data: ResumeData, tpl: TemplateId): string {
  const p = data.personal;
  const name = escapeHtml(fullName(data)) || "Ваше имя";
  const role = escapeHtml(p.role) || "Должность";
  const photo = ph(data);
  switch (tpl) {
    case "classic":
      return `<div class="doc"><header class="doc-hd">${photo}<div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</header>${sumSec(data)}${expSec(data, "classic")}${eduSec(data, "classic")}${skillsSec(data)}${langsSec(data)}</div>`;
    case "modern":
      return `<div class="doc"><header class="doc-hd hd"><div class="hd-t"><div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</div>${photo}</header>${sumSec(data)}${expSec(data, "modern")}${eduSec(data, "modern")}${skillsSec(data)}${langsSec(data)}</div>`;
    case "minimal":
      return `<div class="doc"><header class="doc-hd hd"><div class="hd-t"><div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</div>${photo}</header>${sumSec(data)}${expSec(data, "minimal")}${eduSec(data, "minimal")}${skillsSec(data)}${langsSec(data)}</div>`;
    case "executive":
      return `<aside class="ex-side">${photo}<div class="doc-name">${name}</div><div class="doc-role">${role}</div><div class="ex-ct">${contactsV(data)}</div>${sideBlocks(data, "ex-block", "Навыки", "Личные качества")}</aside><div class="ex-main">${sumSec(data)}${expSec(data, "executive")}${eduSec(data, "executive")}</div>`;
    case "gradient":
      return `<header class="gr-hd hd"><div class="hd-t"><div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</div>${photo}</header><div class="gr-body">${sumSec(data)}${expSec(data, "gradient")}${eduSec(data, "gradient")}${skillsSec(data)}${langsSec(data)}</div>`;
    case "compact":
      return `<aside class="cp-side">${photo}<div class="doc-name">${name}</div><div class="doc-role">${role}</div><div class="cp-ct">${contactsV(data)}</div>${sideBlocks(data, "cp-block", "Навыки", "Качества")}</aside><div class="cp-main">${sumSec(data)}${expSec(data, "compact")}${eduSec(data, "compact")}</div>`;
    case "fresher":
      return `<div class="doc"><header class="doc-hd hd"><div class="hd-t"><div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</div>${photo}</header>${data.summary ? `<div class="hl"><div class="hl-t">Обо мне</div><p>${escapeHtml(data.summary)}</p></div>` : ""}${skillsSec(data)}${eduSec(data, "fresher")}${expSec(data, "fresher")}${langsSec(data)}</div>`;
    case "timeline":
      return `<div class="doc"><header class="doc-hd hd"><div class="hd-t"><div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</div>${photo}</header>${sumSec(data)}${expSec(data, "timeline")}${eduSec(data, "timeline")}${skillsSec(data)}${langsSec(data)}</div>`;
    case "twocol":
      return `<header class="tc-hd hd"><div class="hd-t"><div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</div>${photo}</header><div class="tc-body"><div class="tc-main">${sumSec(data)}${expSec(data, "twocol")}</div><aside class="tc-rail">${hardSkills(data).length ? `<div class="rail-card">${secT("Навыки")}<div class="sk">${tags(hardSkills(data))}</div></div>` : ""}${data.skills.soft.length ? `<div class="rail-card">${secT("Качества")}<div class="sk">${tags(data.skills.soft)}</div></div>` : ""}${data.languages.length ? `<div class="rail-card">${secT("Языки")}${langsInline(data)}</div>` : ""}${data.education.length ? `<div class="rail-card">${secT("Образование")}${eduRows(data, "twocol")}</div>` : ""}</aside></div>`;
    case "academic":
      return `<div class="doc"><header class="doc-hd">${photo}<div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</header>${sumSec(data)}${eduSec(data, "academic")}${expSec(data, "academic")}${skillsSec(data)}${langsSec(data)}</div>`;
    default:
      return "";
  }
}

/**
 * Word-совместимое представление резюме (HTML, открывается в MS Word / Google Docs).
 * Линейная вёрстка без flex/grid — чтобы документ корректно редактировался в Word.
 */
export function buildResumeDocHtml(data: ResumeData): string {
  const p = data.personal;
  const name = escapeHtml(fullName(data)) || "Ваше имя";
  const contacts = [p.city, p.phone, p.email, p.link].filter(Boolean).map((x) => escapeHtml(x)).join(" · ");
  const h2 = (t: string) =>
    `<h2 style="font-size:13pt;color:#111;border-bottom:1px solid #bbb;padding-bottom:3pt;margin:16pt 0 6pt;">${t}</h2>`;
  const parts: string[] = [];
  if (p.role) parts.push(`<p style="margin:2pt 0 0;color:#444;font-size:11pt;">${escapeHtml(p.role)}</p>`);
  if (contacts) parts.push(`<p style="margin:2pt 0 0;color:#555;font-size:10pt;">${contacts}</p>`);
  if (data.summary) parts.push(h2("О себе") + `<p style="margin:0;">${escapeHtml(data.summary)}</p>`);
  if (data.experience.length) {
    parts.push(h2("Опыт работы"));
    data.experience.forEach((e) => {
      parts.push(
        `<p style="margin:0 0 2pt;"><b>${escapeHtml(e.position || "Должность")}</b>${e.company ? " — " + escapeHtml(e.company) : ""}</p>`
      );
      if (e.period) parts.push(`<p style="margin:0 0 2pt;color:#666;font-size:10pt;">${escapeHtml(e.period)}</p>`);
      if (e.bullets.length) {
        parts.push(`<ul style="margin:2pt 0 8pt 18pt;">${e.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`);
      }
    });
  }
  if (data.education.length) {
    parts.push(h2("Образование"));
    data.education.forEach((e) => {
      parts.push(`<p style="margin:0 0 2pt;"><b>${escapeHtml(e.institution || "Учебное заведение")}</b></p>`);
      const line = [e.field, e.degree].filter(Boolean).map((x) => escapeHtml(x)).join(", ");
      const range = [e.start, e.end].filter(Boolean).map((x) => escapeHtml(x)).join(" — ");
      if (line || range) {
        parts.push(`<p style="margin:0 0 8pt;color:#666;font-size:10pt;">${line}${range ? (line ? " · " : "") + range : ""}</p>`);
      }
    });
  }
  const hard = [...data.skills.hard, ...data.skills.tools].map((x) => escapeHtml(x)).join(", ");
  if (hard) parts.push(h2("Навыки") + `<p style="margin:0;">${hard}</p>`);
  if (data.skills.soft.length) {
    parts.push(h2("Личные качества") + `<p style="margin:0;">${data.skills.soft.map((x) => escapeHtml(x)).join(", ")}</p>`);
  }
  if (data.languages.length) {
    parts.push(h2("Языки") + `<p style="margin:0;">${data.languages.map((l) => `${escapeHtml(l.name)} — ${escapeHtml(l.level)}`).join(", ")}</p>`);
  }
  const title = escapeHtml("Резюме — " + (fullName(data) || "без имени"));
  return `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${title}</title><style>@page{size:A4;margin:2cm}body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#111;line-height:1.4}h1{font-size:18pt;margin:0}ul{margin:2pt 0 8pt 18pt;padding:0}li{margin:0 0 2pt}</style></head><body><h1>${name}</h1>${parts.join("")}</body></html>`;
}
