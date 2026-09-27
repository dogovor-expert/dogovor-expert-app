import type { ResumeData, TemplateId } from "./types";

const IC = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  phone:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
  cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/><path d="M22 10v6"/></svg>',
  wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.9 15.5A2 2 0 0 0 8.5 14.1l-6.1-1.6a.5.5 0 0 1 0-1L8.5 9.9A2 2 0 0 0 9.9 8.5l1.6-6.1a.5.5 0 0 1 1 0l1.6 6.1a2 2 0 0 0 1.4 1.4l6.1 1.6a.5.5 0 0 1 0 1l-6.1 1.6a2 2 0 0 0-1.4 1.4l-1.6 6.1a.5.5 0 0 1-1 0z"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>',
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
function secTI(t: string, icon: IconKey): string { return `<h2 class="sec-t ic"><span class="ic">${IC[icon]}</span>${t}</h2>`; }
function sec(t: string, b: string): string { return `<section class="sec">${secT(t)}${b}</section>`; }
/** Контактная полоса под шапкой (шаблоны Tech Pro / Classic Legal). */
function contactBar(data: ResumeData): string {
  const a = contactItems(data);
  if (!a.length) return "";
  return `<div class="cbar">${a.map(([k, v]) => `<span class="cont">${IC[k]}<span>${escapeHtml(v)}</span></span>`).join("")}</div>`;
}
/** Карточка рейла с иконкой заголовка (шаблон Executive Corporate). */
function railCardI(icon: IconKey, title: string, body: string): string {
  return `<div class="rail-card">${secTI(title, icon)}${body}</div>`;
}
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

function sideBlocks(data: ResumeData, cls: string, title: string, titleSoft: string, foot?: string): string {
  const hard = hardSkills(data);
  return (
    (hard.length ? `<div class="${cls}"><div class="${cls}-t">${title}</div><div class="sk">${tags(hard)}</div></div>` : "") +
    (data.skills.soft.length ? `<div class="${cls}"><div class="${cls}-t">${titleSoft}</div><div class="sk">${tags(data.skills.soft)}</div></div>` : "") +
    (data.languages.length ? `<div class="${cls}"><div class="${cls}-t">Языки</div><div class="lg">${langSpans(data)}</div></div>` : "") +
    (foot ? `<div class="${cls}-foot">${foot}</div>` : "")
  );
}

/* ===== Эталонные макеты (по образцу РЕЗЮМЕ 3): exec / side / base ===== */

type SampleLayout = "exec" | "side" | "base";
interface SampleCfg { layout: SampleLayout; accent: string; serif?: boolean; tech?: boolean; light?: boolean }

/** Каждый шаблон отрисован одной из трёх эталонных раскладок с собственным акцентом. */
const SAMPLE_MAP: Record<TemplateId, SampleCfg> = {
  classic: { layout: "base", accent: "#0f172a", serif: true },
  modern: { layout: "base", accent: "#4f46e5" },
  minimal: { layout: "base", accent: "#64748b" },
  executive: { layout: "side", accent: "#0b1220" },
  gradient: { layout: "exec", accent: "#6d28d9" },
  compact: { layout: "side", accent: "#4f46e5", light: true },
  fresher: { layout: "base", accent: "#e11d48" },
  timeline: { layout: "base", accent: "#4f46e5" },
  twocol: { layout: "side", accent: "#0f172a", light: true },
  academic: { layout: "base", accent: "#111827", serif: true },
  expert: { layout: "base", accent: "#4f46e5" },
  creative: { layout: "base", accent: "#ea580c" },
  corporate: { layout: "exec", accent: "#1e293b" },
  techpro: { layout: "base", accent: "#4f46e5", tech: true },
  legal: { layout: "base", accent: "#0f172a", serif: true },
  nordic: { layout: "base", accent: "#0d9488" },
  sidebarpro: { layout: "side", accent: "#065f46" },
  ocean: { layout: "exec", accent: "#0369a1" },
  terracotta: { layout: "base", accent: "#9a3412" },
  graphite: { layout: "base", accent: "#3f3f46" },
  forest: { layout: "side", accent: "#166534", light: true },
  wine: { layout: "exec", accent: "#881337", serif: true },
};

function smpChips(arr: string[]): string {
  return `<div class="smp-chips">${(arr ?? []).map((x) => `<span class="smp-chip">${escapeHtml(x)}</span>`).join("")}</div>`;
}

function smpContacts(data: ResumeData, mode: "pills" | "rows" | "inline"): string {
  const a = contactItems(data);
  if (!a.length) return "";
  const cls = mode === "pills" ? "smp-pills" : mode === "inline" ? "smp-cbar" : "smp-cont-list";
  const items = a.map(([k, v]) => `<span class="smp-cont">${IC[k]}<span>${escapeHtml(v)}</span></span>`).join("");
  return `<div class="${cls}">${items}</div>`;
}

function smpExpRows(data: ResumeData, plain: boolean): string {
  return data.experience.map((e) => {
    const t = escapeHtml(e.position || "Должность");
    const c = escapeHtml(e.company || "Компания");
    const d = escapeHtml(e.period || "");
    const b = e.bullets?.length ? `<ul class="smp-xp-b">${e.bullets.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : "";
    return (
      `<div class="${plain ? "smp-x2" : "smp-xp-i"}">` +
      (plain ? "" : '<span class="smp-dot"></span>') +
      `<div class="smp-xp-top"><b>${t}</b><i>${d}</i></div>` +
      `<div class="smp-xp-c">${c}</div>${b}</div>`
    );
  }).join("");
}

function smpEdu(data: ResumeData): string {
  return data.education.map((e) => {
    const line = [escapeHtml(e.field), escapeHtml(e.degree)].filter(Boolean).join(", ");
    const range = [escapeHtml(e.start), escapeHtml(e.end)].filter(Boolean).join(" — ");
    return `<div class="smp-ed"><b>${escapeHtml(e.institution || "Учебное заведение")}</b>${line ? `<span>${line}</span>` : ""}${range ? `<i>${range}</i>` : ""}</div>`;
  }).join("");
}

function smpLangs(data: ResumeData): string {
  return data.languages.map((l) => `<div class="smp-lg-row"><b>${escapeHtml(l.name)}</b><span>${escapeHtml(l.level)}</span></div>`).join("");
}

function samplePhoto(data: ResumeData, variant: "block" | "circle" | "top"): string {
  if (!showPh(data)) return "";
  const src = escapeHtml(data.personal.photo);
  if (variant === "block") return `<div class="smp-ph"><img src="${src}" alt="Фото кандидата"><span class="chk">✓</span></div>`;
  if (variant === "circle") return `<div class="smp-bar-ph"><img src="${src}" alt="Фото кандидата"></div>`;
  return `<div class="smp-top-ph"><img src="${src}" alt="Фото кандидата"></div>`;
}

function buildSampleHtml(data: ResumeData, cfg: SampleCfg): string {
  const name = escapeHtml(fullName(data)) || "Ваше имя";
  const role = escapeHtml(data.personal.role) || "Должность";
  const summary = data.summary ? escapeHtml(data.summary) : "";
  const hard = hardSkills(data);
  const cls = (extra: string) => `doc smp ${extra}${cfg.serif ? " smp-serif" : ""}${cfg.tech ? " smp-tech" : ""}`;

  if (cfg.layout === "exec") {
    return (
      `<div class="${cls("smp-exec")}" style="--ac:${cfg.accent}">` +
      `<header class="smp-hd">${samplePhoto(data, "block")}<div class="smp-hd-t">` +
      `<h1>${name}</h1><div class="smp-role">${role}</div>${smpContacts(data, "pills")}</div></header>` +
      `<div class="smp-body"><div class="smp-main">` +
      (summary ? `<section><h2 class="smp-sec">${IC.sparkles}<span>О себе и ключевые результаты</span></h2><p class="smp-sum">${summary}</p></section>` : "") +
      (data.experience.length ? `<section><h2 class="smp-sec">${IC.briefcase}<span>Опыт работы</span></h2><div class="smp-xp">${smpExpRows(data, false)}</div></section>` : "") +
      `</div><aside class="smp-rail">` +
      (hard.length ? `<div><h3 class="smp-sec">${IC.wrench}<span>Ключевые навыки</span></h3>${smpChips(hard)}</div>` : "") +
      (data.skills.soft.length ? `<div><h3 class="smp-sec">${IC.star}<span>Личные качества</span></h3>${smpChips(data.skills.soft)}</div>` : "") +
      (data.education.length ? `<div><h3 class="smp-sec">${IC.book}<span>Образование</span></h3>${smpEdu(data)}</div>` : "") +
      (data.languages.length ? `<div><h3 class="smp-sec">${IC.globe}<span>Языки</span></h3>${smpLangs(data)}</div>` : "") +
      `</aside></div></div>`
    );
  }

  if (cfg.layout === "side") {
    return (
      `<div class="${cls(`smp-side${cfg.light ? " smp-light" : ""}`)}" style="--ac:${cfg.accent}"><div class="smp-inner">` +
      `<aside class="smp-bar"><div>` +
      samplePhoto(data, "circle") +
      (contactItems(data).length ? `<div class="smp-bar-sec"><div class="smp-bar-lbl">Контакты</div>${smpContacts(data, "rows")}</div>` : "") +
      (hard.length ? `<div class="smp-bar-sec"><div class="smp-bar-lbl">Навыки</div>${smpChips(hard)}</div>` : "") +
      (data.languages.length ? `<div class="smp-bar-sec"><div class="smp-bar-lbl">Языки</div>${smpLangs(data)}</div>` : "") +
      `</div><div class="smp-bar-foot">Dogovor.expert · резюме по стандартам 2026</div></aside>` +
      `<div class="smp-page"><h1>${name}</h1><div class="smp-role">${role}</div>` +
      (summary ? `<section><h3 class="smp-lbl">Профессиональный профиль</h3><p class="smp-sum">${summary}</p></section>` : "") +
      (data.experience.length ? `<section><h3 class="smp-lbl">Опыт работы</h3><div class="smp-xp2">${smpExpRows(data, true)}</div></section>` : "") +
      (data.education.length ? `<section><h3 class="smp-lbl">Образование</h3>${smpEdu(data)}</section>` : "") +
      `</div></div></div>`
    );
  }

  const inline = smpContacts(data, "inline");
  return (
    `<div class="${cls("smp-base")}" style="--ac:${cfg.accent}">` +
    `<header class="smp-top"><div class="smp-top-t"><h1>${name}</h1><div class="smp-role">${role}</div>` +
    (summary ? `<p class="smp-lead">${summary}</p>` : "") +
    `</div>${samplePhoto(data, "top")}</header>` +
    inline +
    `<div class="smp-cols"><div class="smp-main">` +
    (data.experience.length ? `<section><h2 class="smp-sec"><span class="smp-bullet"></span><span>Опыт работы</span></h2><div class="smp-xp2">${smpExpRows(data, true)}</div></section>` : "") +
    `</div><aside class="smp-rail">` +
    (hard.length ? `<div><h3 class="smp-h3">Навыки</h3>${smpChips(hard)}</div>` : "") +
    (data.skills.soft.length ? `<div><h3 class="smp-h3">Личные качества</h3>${smpChips(data.skills.soft)}</div>` : "") +
    (data.education.length ? `<div><h3 class="smp-h3">Образование</h3>${smpEdu(data)}</div>` : "") +
    (data.languages.length ? `<div><h3 class="smp-h3">Языки</h3>${smpLangs(data)}</div>` : "") +
    `</aside></div></div>`
  );
}

/** Собирает HTML документа резюме для выбранного шаблона. */
export function buildResumeHtml(data: ResumeData, tpl: TemplateId): string {
  const sc = SAMPLE_MAP[tpl];
  if (sc) return buildSampleHtml(data, sc);
  return buildLegacyHtml(data, tpl);
}

function buildLegacyHtml(data: ResumeData, tpl: TemplateId): string {
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
    case "corporate":
      return `<div class="doc"><header class="band"><div class="doc-name">${name}</div><div class="doc-role">${role}</div><div class="band-ct">${contactsV(data)}</div></header>${sumSec(data)}<div class="xp2-grid"><div class="xp2-main">${expSec(data, "modern")}${eduSec(data, "corporate")}</div><aside class="xp2-rail">${hardSkills(data).length ? railCardI("wrench", "Ключевые навыки", `<div class="sk">${tags(hardSkills(data))}</div>`) : ""}${data.education.length ? railCardI("book", "Образование", eduRows(data, "corporate")) : ""}${data.languages.length ? railCardI("globe", "Языки", `<div class="lg dots">${langSpans(data)}</div>`) : ""}</aside></div></div>`;
    case "techpro":
      return `<div class="doc"><header class="doc-hd hd"><div class="hd-t"><div class="doc-name">${name}</div><div class="doc-role">${role}</div></div>${photo}</header>${contactBar(data)}${sumSec(data)}<div class="xp2-grid"><div class="xp2-main">${expSec(data, "modern")}${eduSec(data, "techpro")}</div><aside class="xp2-rail">${hardSkills(data).length ? `<div class="rail-card">${secT("Навыки")}<div class="sk">${tags(hardSkills(data))}</div></div>` : ""}${data.skills.soft.length ? `<div class="rail-card">${secT("Качества")}<div class="sk">${tags(data.skills.soft)}</div></div>` : ""}${data.languages.length ? `<div class="rail-card">${secT("Языки")}<div class="lg dots">${langSpans(data)}</div></div>` : ""}</aside></div></div>`;
    case "legal":
      return `<div class="doc"><header class="doc-hd"><div class="doc-name">${name}</div><div class="doc-role">${role}</div></header>${contactBar(data)}${sumSec(data)}${expSec(data, "modern")}${eduSec(data, "legal")}${skillsSec(data)}${langsSec(data)}</div>`;
    case "nordic":
      return `<div class="doc"><header class="doc-hd hd"><div class="hd-t"><div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</div>${photo}</header>${sumSec(data)}${expSec(data, "nordic")}${eduSec(data, "nordic")}${skillsSec(data)}${langsSec(data)}</div>`;
    case "sidebarpro":
      return `<aside class="ex-side">${photo}<div class="doc-name">${name}</div><div class="doc-role">${role}</div><div class="ex-ct">${contactsV(data)}</div>${sideBlocks(data, "ex-block", "Навыки", "Личные качества", "Dogovor.expert · резюме по стандартам 2026")}</aside><div class="ex-main">${sumSec(data)}${expSec(data, "sidebarpro")}${eduSec(data, "sidebarpro")}</div>`;
    case "ocean":
      return `<div class="doc"><header class="band hd"><div class="hd-t"><div class="doc-name">${name}</div><div class="doc-role">${role}</div><div class="band-ct">${contactsV(data)}</div></div>${photo}</header>${sumSec(data)}${expSec(data, "ocean")}${eduSec(data, "ocean")}${skillsSec(data)}${langsSec(data)}</div>`;
    case "terracotta":
      return `<div class="doc"><div class="strip" aria-hidden="true"></div><header class="doc-hd"><div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</header>${sumSec(data)}${expSec(data, "terracotta")}${eduSec(data, "terracotta")}${skillsSec(data)}${langsSec(data)}</div>`;
    case "graphite":
      return `<div class="doc"><header class="doc-hd hd"><div class="hd-t"><div class="doc-name">${name}</div><div class="doc-role">${role}</div>${contacts(data)}</div>${photo}</header>${sumSec(data)}${expSec(data, "graphite")}${eduSec(data, "graphite")}${skillsSec(data)}${langsSec(data)}</div>`;
    case "forest":
      return `<aside class="cp-side">${photo}<div class="doc-name">${name}</div><div class="doc-role">${role}</div><div class="cp-ct">${contactsV(data)}</div>${sideBlocks(data, "cp-block", "Навыки", "Качества")}</aside><div class="cp-main">${sumSec(data)}${expSec(data, "forest")}${eduSec(data, "forest")}</div>`;
    case "wine":
      return `<div class="doc"><header class="band"><div class="doc-name">${name}</div><div class="doc-role">${role}</div><div class="band-ct">${contactsV(data)}</div></header>${sumSec(data)}${expSec(data, "wine")}${eduSec(data, "wine")}${skillsSec(data)}${langsSec(data)}</div>`;
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
  /** Таймлайн опыта: левая акцентная линейка у каждой записи (макеты Corporate/Tech/Legal). */
  expDots?: boolean;
  /** Подпись внизу боковой колонки (макет Modern Sidebar). */
  sideFoot?: string;
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
  corporate: { accent: "#1e293b", layout: "single", headerBg: "#1e293b", headerFg: "#ffffff", expDots: true },
  techpro: { accent: "#4f46e5", layout: "columns", expDots: true },
  legal: { accent: "#0f172a", layout: "single", serif: true, expDots: true },
  nordic: { accent: "#0d9488", layout: "single" },
  sidebarpro: { accent: "#047857", layout: "sidebar", sideBg: "#065f46", sideFg: "#ecfdf5", sideAccent: "#6ee7b7", sideFoot: "Dogovor.expert · резюме по стандартам 2026" },
  ocean: { accent: "#0369a1", layout: "single", headerBg: "#0369a1", headerFg: "#ffffff" },
  terracotta: { accent: "#9a3412", layout: "single", strip: true },
  graphite: { accent: "#3f3f46", layout: "single" },
  forest: { accent: "#166534", layout: "sidebar", sideBg: "#f0fdf4", sideFg: "#14532d", sideAccent: "#166534" },
  wine: { accent: "#881337", layout: "single", headerBg: "#881337", headerFg: "#ffffff", serif: true },
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
          const body = head + bl;
          return cfg.expDots
            ? `<div style="border-left:2pt solid ${cfg.accent};padding-left:8pt;margin:0 0 6pt;">${body}</div>`
            : body;
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
      (langs ? `<p style="margin:0 0 2pt;color:${sideAccent};font-weight:bold;font-size:9.5pt;">ЯЗЫКИ</p><p style="margin:0;color:${sideFg};font-size:9.5pt;">${langs}</p>` : "") +
      (cfg.sideFoot ? `<p style="margin:10pt 0 0;color:${sideFg};font-size:8pt;border-top:1pt solid ${sideAccent};padding-top:6pt;">${escapeHtml(cfg.sideFoot)}</p>` : "");
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
