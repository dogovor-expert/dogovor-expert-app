import type { ResumeData, TemplateId } from "./types";

const IC = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  phone:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
  cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/><path d="M22 10v6"/></svg>',
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
    case "expert":
      return `<div class="doc"><div class="strip" aria-hidden="true"></div><header class="doc-hd"><div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</header>${sumSec(data)}<div class="xp2-grid"><div class="xp2-main">${expSec(data, "modern")}${eduSec(data, "expert")}</div><aside class="xp2-rail">${hardSkills(data).length ? `<div class="rail-card">${secT("Навыки")}<div class="sk">${tags(hardSkills(data))}</div></div>` : ""}${data.skills.soft.length ? `<div class="rail-card">${secT("Личные качества")}<div class="sk">${tags(data.skills.soft)}</div></div>` : ""}${data.languages.length ? `<div class="rail-card">${secT("Языки")}<div class="lg dots">${langSpans(data)}</div></div>` : ""}</aside></div></div>`;
    case "creative":
      return `<div class="doc"><div class="strip" aria-hidden="true"></div><header class="doc-hd hd"><div class="hd-t"><div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</div>${photo}</header>${sumSec(data)}${expSec(data, "modern")}${skillsSec(data)}${eduSec(data, "creative")}${data.languages.length ? sec("Языки", `<div class="lg inline"><span class="cap">${IC.cap}</span>${langSpans(data)}</div>`) : ""}</div>`;
    default:
      return "";
  }
}

interface DocTemplateStyle {
  accent: string;
  layout: "single" | "sidebar" | "columns";
  center?: boolean;
  serif?: boolean;
  headerBg?: string;
  headerFg?: string;
  sideBg?: string;
  sideFg?: string;
  sideAccent?: string;
  /** Тонкая акцентная полоса сверху документа (как в мокапах «Эксперт»/«Креатив»). */
  strip?: boolean;
}

const DOC_TEMPLATES: Record<TemplateId, DocTemplateStyle> = {
  classic: { accent: "#0f172a", layout: "single", center: true },
  modern: { accent: "#4F46E5", layout: "single" },
  minimal: { accent: "#9ca3af", layout: "single" },
  executive: { accent: "#C9A227", layout: "sidebar", serif: true, sideBg: "#0b1220", sideFg: "#e2e8f0", sideAccent: "#E7C55A" },
  gradient: { accent: "#6D28D9", layout: "single", headerBg: "#5b21b6", headerFg: "#ffffff" },
  compact: { accent: "#4F46E5", layout: "sidebar", sideBg: "#F8FAFC", sideFg: "#334155", sideAccent: "#4F46E5" },
  fresher: { accent: "#E11D48", layout: "single" },
  timeline: { accent: "#4F46E5", layout: "single" },
  twocol: { accent: "#0f172a", layout: "sidebar", headerBg: "#0f172a", headerFg: "#ffffff", sideBg: "#F8FAFC", sideFg: "#334155", sideAccent: "#4F46E5" },
  academic: { accent: "#111827", layout: "single", center: true, serif: true },
  expert: { accent: "#4f46e5", layout: "columns", strip: true },
  creative: { accent: "#ea580c", layout: "single", strip: true },
};

/**
 * Word-совместимое представление резюме (HTML, открывается в MS Word / Google Docs).
 * Повторяет выбранный шаблон: акцентный цвет, шапка или боковая колонка (таблицей),
 * линейные секции — без flex/grid, чтобы документ корректно открывался и редактировался в Word.
 */
export function buildResumeDocHtml(data: ResumeData, tpl: TemplateId): string {
  const p = data.personal;
  const cfg: DocTemplateStyle = DOC_TEMPLATES[tpl];
  const font = cfg.serif ? "'Times New Roman',Georgia,serif" : "Arial,Helvetica,sans-serif";
  const name = escapeHtml(fullName(data)) || "Ваше имя";
  const role = escapeHtml(p.role);
  const contacts = [p.city, p.phone, p.email, p.link].filter(Boolean).map((x) => escapeHtml(x));
  const strong = "#0f172a";

  const h2 = (t: string) =>
    `<h2 style="font-family:${font};font-size:12pt;color:${cfg.accent};border-bottom:1px solid ${cfg.accent};padding-bottom:2pt;margin:14pt 0 5pt;">${t}</h2>`;

  const summary = data.summary ? h2("О себе") + `<p style="margin:0;">${escapeHtml(data.summary)}</p>` : "";

  const exp = data.experience.length
    ? h2("Опыт работы") +
      data.experience
        .map((e) => {
          const head = `<p style="margin:0 0 1pt;"><b style="color:${strong};">${escapeHtml(e.position || "Должность")}</b>${e.company ? ` <span style="color:${cfg.accent};">— ${escapeHtml(e.company)}</span>` : ""}${e.period ? ` <span style="color:#6b7280;font-size:9.5pt;">(${escapeHtml(e.period)})</span>` : ""}</p>`;
          const bl = e.bullets.length
            ? `<ul style="margin:2pt 0 7pt 16pt;padding:0;">${e.bullets.map((b) => `<li style="margin:0 0 1pt;">${escapeHtml(b)}</li>`).join("")}</ul>`
            : `<p style="margin:0 0 6pt;"></p>`;
          return head + bl;
        })
        .join("")
    : "";

  const edu = data.education.length
    ? h2("Образование") +
      data.education
        .map((e) => {
          const line = [e.field, e.degree].filter(Boolean).map((x) => escapeHtml(x)).join(", ");
          const range = [e.start, e.end].filter(Boolean).map((x) => escapeHtml(x)).join(" — ");
          return `<p style="margin:0 0 5pt;"><b style="color:${strong};">${escapeHtml(e.institution || "Учебное заведение")}</b><br><span style="color:#6b7280;font-size:9.5pt;">${line}${range ? (line ? " · " : "") + range : ""}</span></p>`;
        })
        .join("")
    : "";

  const hard = [...data.skills.hard, ...data.skills.tools].map((x) => escapeHtml(x)).join(", ");
  const soft = data.skills.soft.map((x) => escapeHtml(x)).join(", ");
  const langs = data.languages.map((l) => `${escapeHtml(l.name)} — ${escapeHtml(l.level)}`).join(", ");

  const title = escapeHtml("Резюме — " + (fullName(data) || "без имени"));
  const strip = cfg.strip
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 10pt;"><tr><td bgcolor="${cfg.accent}" style="font-size:1pt;line-height:1pt;">&nbsp;</td></tr></table>`
    : "";
  const head =
    `<head><meta charset="utf-8"><title>${title}</title><style>` +
    `@page{size:A4;margin:1.6cm}` +
    `body{font-family:${font};font-size:10.5pt;color:#1f2937;line-height:1.45;margin:0}` +
    `h1{font-family:${font};margin:0}h2{font-family:${font}}` +
    `ul{margin:2pt 0 6pt 16pt;padding:0}li{margin:0 0 1pt}p{margin:0 0 3pt}` +
    `</style></head>`;
  const open = `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">${head}<body>`;
  const close = `</body></html>`;

  const singleHeader =
    `<h1 style="color:${cfg.accent};font-size:20pt;${cfg.center ? "text-align:center;" : ""}">${name}</h1>` +
    (role ? `<p style="margin:3pt 0 0;color:#6b7280;${cfg.center ? "text-align:center;" : ""};">${role}</p>` : "") +
    (contacts.length ? `<p style="margin:2pt 0 0;color:#6b7280;font-size:9.5pt;${cfg.center ? "text-align:center;" : ""};">${contacts.join(" · ")}</p>` : "");

  if (cfg.layout === "columns") {
    const colSide =
      (hard ? `<p style="margin:0 0 2pt;color:${cfg.accent};font-weight:bold;font-size:9.5pt;">НАВЫКИ</p><p style="margin:0 0 8pt;font-size:9.5pt;">${hard}</p>` : "") +
      (soft ? `<p style="margin:0 0 2pt;color:${cfg.accent};font-weight:bold;font-size:9.5pt;">ЛИЧНЫЕ КАЧЕСТВА</p><p style="margin:0 0 8pt;font-size:9.5pt;">${soft}</p>` : "") +
      (langs ? `<p style="margin:0 0 2pt;color:${cfg.accent};font-weight:bold;font-size:9.5pt;">ЯЗЫКИ</p><p style="margin:0;font-size:9.5pt;">${langs}</p>` : "");
    const colHeader =
      `<h1 style="color:${cfg.accent};font-size:20pt;">${name}</h1>` +
      (role ? `<p style="margin:3pt 0 0;color:#4b5563;font-weight:bold;">${role}</p>` : "") +
      (contacts.length ? `<p style="margin:2pt 0 0;color:#6b7280;font-size:9.5pt;">${contacts.join(" · ")}</p>` : "");
    const table =
      `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>` +
      `<td width="64%" valign="top" style="padding:2pt 14pt 10pt 0;">${summary}${exp}${edu}</td>` +
      `<td width="36%" valign="top" style="padding:2pt 0 10pt 0;">${colSide}</td>` +
      `</tr></table>`;
    return open + strip + colHeader + table + close;
  }

  if (cfg.layout === "sidebar") {
    const sideBg = cfg.sideBg ?? "#F8FAFC";
    const sideFg = cfg.sideFg ?? "#334155";
    const sideAccent = cfg.sideAccent ?? cfg.accent;
    const sideHead = cfg.headerBg
      ? ""
      : `<h1 style="color:${sideFg === "#e2e8f0" ? "#ffffff" : "#0f172a"};font-size:17pt;margin:0 0 3pt;">${name}</h1>` +
        (role ? `<p style="margin:0 0 8pt;color:${sideAccent};font-size:9.5pt;font-weight:bold;">${role}</p>` : "");
    const side =
      sideHead +
      (contacts.length ? `<p style="margin:0 0 8pt;color:${sideFg};font-size:9.5pt;line-height:1.5;">${contacts.join("<br>")}</p>` : "") +
      (hard ? `<p style="margin:0 0 2pt;color:${sideAccent};font-weight:bold;font-size:9.5pt;">НАВЫКИ</p><p style="margin:0 0 8pt;color:${sideFg};font-size:9.5pt;">${hard}</p>` : "") +
      (soft ? `<p style="margin:0 0 2pt;color:${sideAccent};font-weight:bold;font-size:9.5pt;">КАЧЕСТВА</p><p style="margin:0 0 8pt;color:${sideFg};font-size:9.5pt;">${soft}</p>` : "") +
      (langs ? `<p style="margin:0 0 2pt;color:${sideAccent};font-weight:bold;font-size:9.5pt;">ЯЗЫКИ</p><p style="margin:0;color:${sideFg};font-size:9.5pt;">${langs}</p>` : "");
    const bandHeader = cfg.headerBg
      ? `<table width="100%" cellpadding="12" cellspacing="0" style="border-collapse:collapse;margin:0 0 10pt;"><tr><td bgcolor="${cfg.headerBg}"><h1 style="color:${cfg.headerFg};font-size:20pt;margin:0;">${name}</h1>${role ? `<p style="margin:2pt 0 0;color:${cfg.headerFg};">${role}</p>` : ""}${contacts.length ? `<p style="margin:3pt 0 0;font-size:9.5pt;color:${cfg.headerFg};">${contacts.join(" · ")}</p>` : ""}</td></tr></table>`
      : "";
    const table =
      `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>` +
      `<td width="32%" valign="top" bgcolor="${sideBg}" style="padding:10pt;">${side}</td>` +
      `<td width="68%" valign="top" style="padding:2pt 0 10pt 14pt;">${summary}${exp}${edu}</td>` +
      `</tr></table>`;
    return open + bandHeader + table + close;
  }

  const skillsBlock =
    (hard ? h2("Навыки") + `<p style="margin:0;">${hard}</p>` : "") +
    (soft ? h2("Личные качества") + `<p style="margin:0;">${soft}</p>` : "") +
    (langs ? h2("Языки") + `<p style="margin:0;">${langs}</p>` : "");
  const headerBand = cfg.headerBg
    ? `<table width="100%" cellpadding="14" cellspacing="0" style="border-collapse:collapse;margin:0 0 8pt;"><tr><td bgcolor="${cfg.headerBg}"><h1 style="color:${cfg.headerFg};font-size:22pt;margin:0;">${name}</h1>${role ? `<p style="margin:3pt 0 0;color:${cfg.headerFg};">${role}</p>` : ""}${contacts.length ? `<p style="margin:4pt 0 0;font-size:9.5pt;color:${cfg.headerFg};">${contacts.join(" · ")}</p>` : ""}</td></tr></table>`
    : singleHeader;
  return open + strip + headerBand + summary + exp + edu + skillsBlock + close;
}
