"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Briefcase,
  User,
  FileText,
  GraduationCap,
  Star,
  Languages,
  Palette,
  Download,
  X,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
} from "lucide-react";
import { RESUME_CSS } from "@/lib/resume/resumeCss";
import { BUILDER_CSS } from "@/lib/resume/builderCss";
import { PRESETS, PHRASES, SAMPLE_RESUME, TEMPLATES, TEMPLATE_META } from "@/lib/resume/data";
import { buildResumeHtml, countNumericBullets, fullName, hardSkills } from "@/lib/resume/render";
import type { ResumeData, ResumeExperience, ResumeLanguage, TemplateId } from "@/lib/resume/types";

const LS_DATA = "dogovorResumeData";
const LS_TPL = "dogovorResumeTpl";
const LEVELS = ["Родной", "C2", "C1", "B2", "B1", "A2", "A1"] as const;

type SectionId = "prof" | "user" | "sum" | "exp" | "edu" | "sk" | "lg";
type Done = "done" | "part" | "";

interface QualityCheck {
  label: string;
  ok: boolean;
}

function plural(n: number, a: string, b: string, c: string): string {
  const m = n % 100;
  const d = n % 10;
  if (m > 10 && m < 20) return c;
  if (d === 1) return a;
  if (d >= 2 && d <= 4) return b;
  return c;
}

function computeQuality(data: ResumeData): QualityCheck[] {
  const p = data.personal;
  return [
    { label: "Указаны ФИО", ok: Boolean(fullName(data)) },
    { label: "Указана должность", ok: Boolean(p.role) },
    { label: "Телефон и email", ok: Boolean(p.phone && p.email) },
    { label: "Раздел «О себе» (60+ символов)", ok: (data.summary || "").length > 60 },
    { label: "Опыт работы (1+ запись)", ok: data.experience.some((e) => e.position && e.company) },
    { label: "Достижения с цифрами (2+)", ok: countNumericBullets(data) >= 2 },
    { label: "Навыков 5 и больше", ok: hardSkills(data).length >= 5 },
    { label: "Образование заполнено", ok: data.education.some((e) => e.institution) },
    { label: "Языки указаны", ok: data.languages.some((l) => l.name) },
  ];
}

const ACCORDION: Array<{ id: SectionId; title: string; icon: typeof User }> = [
  { id: "prof", title: "Профессия", icon: Briefcase },
  { id: "user", title: "Контакты", icon: User },
  { id: "sum", title: "О себе", icon: FileText },
  { id: "exp", title: "Опыт работы", icon: Briefcase },
  { id: "edu", title: "Образование", icon: GraduationCap },
  { id: "sk", title: "Навыки", icon: Star },
  { id: "lg", title: "Языки", icon: Languages },
];

export default function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>(SAMPLE_RESUME);
  const [tpl, setTpl] = useState<TemplateId>("classic");
  const [presetKey, setPresetKey] = useState("");
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    prof: true, user: false, sum: false, exp: false, edu: false, sk: false, lg: false,
  });
  const [drawer, setDrawer] = useState(false);
  const [filter, setFilter] = useState("all");
  const [qOpen, setQOpen] = useState(false);
  const [scale, setScale] = useState(0.62);
  const [manual, setManual] = useState(false);
  const fitRef = useRef(0.62);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<"edit" | "view">("edit");
  const [loaded, setLoaded] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Загрузка черновика (после гидратации, чтобы не ломать SSR).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_DATA);
      if (raw) setData(JSON.parse(raw) as ResumeData);
      const t = localStorage.getItem(LS_TPL) as TemplateId | null;
      if (t && TEMPLATE_META[t]) setTpl(t);
      const urlTpl = new URLSearchParams(window.location.search).get("tpl") as TemplateId | null;
      if (urlTpl && TEMPLATE_META[urlTpl]) setTpl(urlTpl);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  // Автосохранение.
  useEffect(() => {
    if (!loaded) return;
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(LS_DATA, JSON.stringify(data));
        localStorage.setItem(LS_TPL, tpl);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [data, tpl, loaded]);

  // Масштаб превью: подгоняем под ширину сцены (ResizeObserver), пока пользователь не задал зум вручную.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const compute = () => {
      const avail = el.clientWidth - 48;
      const fit = Math.max(0.25, Math.min(1, avail / 794));
      fitRef.current = fit;
      if (!manual) setScale(fit);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [manual]);

  const zoomBy = (d: number) => {
    setManual(true);
    setScale((s) => Math.max(0.25, Math.min(1.5, s + d)));
  };
  const fitZoom = () => {
    setManual(false);
    setScale(fitRef.current);
  };

  // Масштабирование мини-превью в drawer.
  useEffect(() => {
    if (!drawer) return;
    const raf = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(".rvb-tcard-th").forEach((th) => {
        const mini = th.querySelector<HTMLElement>(".rvb-mini");
        if (!mini) return;
        const s = th.clientWidth / 794;
        mini.style.transformOrigin = "top left";
        mini.style.transform = `scale(${s})`;
        mini.style.width = "794px";
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [drawer, filter, data, tpl]);

  const html = useMemo(() => buildResumeHtml(data, tpl), [data, tpl]);
  const quality = useMemo(() => computeQuality(data), [data]);
  const qPct = Math.round((quality.filter((c) => c.ok).length / quality.length) * 100);

  const patchPersonal = (key: keyof ResumeData["personal"], value: string | boolean) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [key]: value } }));

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const r = reader.result; if (typeof r === "string") patchPersonal("photo", r); };
    reader.readAsDataURL(file);
  };

  const updateExp = (i: number, key: keyof ResumeExperience, value: string) =>
    setData((d) => ({ ...d, experience: d.experience.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)) }));
  const updateBullets = (i: number, value: string) =>
    setData((d) => ({
      ...d,
      experience: d.experience.map((e, idx) =>
        idx === i ? { ...e, bullets: value.split("\n").map((s) => s.trim()).filter(Boolean) } : e
      ),
    }));
  const updateEdu = (i: number, key: keyof ResumeData["education"][number], value: string) =>
    setData((d) => ({ ...d, education: d.education.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)) }));
  const updateLang = (i: number, key: keyof ResumeLanguage, value: string) =>
    setData((d) => ({ ...d, languages: d.languages.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)) }));

  const addSkill = (cat: keyof ResumeData["skills"], value: string) => {
    const v = value.trim();
    if (!v) return;
    setData((d) => ({ ...d, skills: { ...d.skills, [cat]: [...d.skills[cat], v] } }));
  };
  const removeSkill = (cat: keyof ResumeData["skills"], i: number) =>
    setData((d) => ({ ...d, skills: { ...d.skills, [cat]: d.skills[cat].filter((_, idx) => idx !== i) } }));

  const applyPreset = (key: string) => {
    setPresetKey(key);
    const p = PRESETS[key];
    if (!p) return;
    setData((d) => ({
      ...d,
      personal: { ...d.personal, role: p.role || d.personal.role },
      summary: d.summary || p.summary,
      skills: { hard: [...p.hard], soft: [...p.soft], tools: [...p.tools] },
      languages: d.languages.length ? d.languages : p.langs.map(([name, level]) => ({ name, level })),
    }));
  };

  const exportPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const title = `Резюме — ${fullName(data) || "без имени"}`;
    const doc = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${title}</title><style>${RESUME_CSS}</style><style>@page{size:A4;margin:0}html,body{margin:0;background:#fff}.a4{width:210mm;min-height:297mm;box-shadow:none;border-radius:0;margin:0}</style></head><body><div class="a4 t-${tpl}">${buildResumeHtml(data, tpl)}</div></body></html>`;
    w.document.write(doc);
    w.document.close();
    window.setTimeout(() => {
      try { w.focus(); w.print(); } catch { /* окно могло быть закрыто */ }
    }, 400);
  };

  const doneState = (id: SectionId): Done => {
    const p = data.personal;
    switch (id) {
      case "prof":
        return presetKey ? "done" : "";
      case "user":
        return p.surname && p.name && p.phone && p.email ? "done" : "part";
      case "sum":
        return data.summary.length > 60 ? "done" : data.summary ? "part" : "";
      case "exp":
        return data.experience.some((e) => e.position && e.company) ? "done" : data.experience.length ? "part" : "";
      case "edu":
        return data.education.some((e) => e.institution) ? "done" : data.education.length ? "part" : "";
      case "sk":
        return data.skills.hard.length >= 4 ? "done" : data.skills.hard.length ? "part" : "";
      case "lg":
        return data.languages.some((l) => l.name) ? "done" : "";
    }
  };

  const subtitle = (id: SectionId): string => {
    switch (id) {
      case "prof":
        return presetKey ? PRESETS[presetKey].label : "Выберите — подставим подсказки";
      case "user":
        return fullName(data) || "ФИО, телефон, email";
      case "sum":
        return data.summary ? `${data.summary.slice(0, 42)}…` : "3–4 предложения о себе";
      case "exp":
        return data.experience.length
          ? `${data.experience.length} ${plural(data.experience.length, "запись", "записи", "записей")}`
          : "Добавьте места работы";
      case "edu":
        return data.education.length
          ? `${data.education.length} ${plural(data.education.length, "запись", "записи", "записей")}`
          : "Вуз, курсы, колледж";
      case "sk":
        return `${data.skills.hard.length + data.skills.soft.length + data.skills.tools.length} навыков`;
      case "lg":
        return data.languages.length
          ? `${data.languages.length} ${plural(data.languages.length, "язык", "языка", "языков")}`
          : "Языки и уровень";
    }
  };

  const hint = PHRASES[presetKey] ?? PHRASES.programmer;
  const baTip = (
    <div className="rvb-ba">
      <div className="rvb-ba-r bad"><span className="b">✗</span><span>{hint.b}</span></div>
      <div className="rvb-ba-r good"><span className="b">✓</span><span>{hint.g}</span></div>
    </div>
  );

  const filtered = TEMPLATES.filter(
    (t) =>
      filter === "all" ||
      (filter === "safe" && t.ats === "safe") ||
      (filter === "creative" && t.ats === "creative") ||
      (filter === "exec" && t.tags.includes("exec")) ||
      (filter === "first" && t.tags.includes("first"))
  );

  return (
    <div className="rvb">
      <style dangerouslySetInnerHTML={{ __html: RESUME_CSS + BUILDER_CSS }} />

      <div className="rvb-app">
        {/* Форма */}
        <aside className={`rvb-panel ${tab === "edit" ? "mobile-on" : ""}`}>
          <nav className="rvb-nav">
            {ACCORDION.map(({ id, title, icon: Icon }) => {
              const state = doneState(id);
              const isOpen = open[id];
              return (
                <div className="rvb-acc" key={id}>
                  <button
                    type="button"
                    className={`rvb-acc-h ${isOpen ? "on" : ""}`}
                    onClick={() => setOpen((o) => ({ ...o, [id]: !o[id] }))}
                    aria-expanded={isOpen}
                  >
                    <span className="rvb-ic"><Icon className="h-4 w-4" aria-hidden /></span>
                    <span className="rvb-acc-t">
                      <b>{title}</b>
                      <small>{subtitle(id)}</small>
                    </span>
                    <span className={`rvb-st ${state}`}>{state === "done" ? "✓" : ""}</span>
                  </button>
                  {isOpen && <div className="rvb-acc-b">{renderSection(id)}</div>}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Просмотр */}
        <section className={`rvb-stage ${tab === "view" ? "mobile-on" : ""}`}>
          <div className="rvb-stagebar">
            <div className="tn">Шаблон: <span>{TEMPLATE_META[tpl]?.name}</span></div>
            <div className="rvb-qwrap">
              <button type="button" className="rvb-qbtn" onClick={() => setQOpen((v) => !v)} aria-expanded={qOpen}>
                <span className="rvb-ring">
                  <svg width="30" height="30" viewBox="0 0 30 30">
                    <circle cx="15" cy="15" r="12.5" fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
                    <circle
                      cx="15" cy="15" r="12.5" fill="none" strokeWidth="3.5" strokeLinecap="round"
                      stroke={qPct >= 80 ? "#059669" : qPct >= 50 ? "#4F46E5" : "#D97706"}
                      strokeDasharray="78.5" strokeDashoffset={78.5 * (1 - qPct / 100)}
                    />
                  </svg>
                  <span className="qn">{qPct}%</span>
                </span>
                <span className="hidden sm:inline text-[12.5px] font-semibold text-gray-700">Качество</span>
              </button>
              {qOpen && (
                <div className="rvb-qpop on">
                  <h4>Готовность резюме</h4>
                  <div className="rvb-qsub">
                    {qPct >= 80 ? "Отличное резюме — можно отправлять" : qPct >= 50 ? "Хорошо! Осталось несколько пунктов" : "Заполните ключевые разделы"}
                  </div>
                  {quality.map((c) => (
                    <div className={`rvb-qcheck ${c.ok ? "ok" : ""}`} key={c.label}>
                      <span className="qi">✓</span>
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="rvb-btn rvb-btn-o" onClick={() => setDrawer(true)}>
              <Palette className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Шаблоны</span>
            </button>
            <button type="button" className="rvb-btn rvb-btn-p" onClick={exportPdf}>
              <Download className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Скачать PDF</span>
            </button>
            <div className="rvb-zoom">
              <button type="button" onClick={() => zoomBy(-0.08)} aria-label="Уменьшить"><ZoomOut className="h-4 w-4" aria-hidden /></button>
              <span className="zv">{Math.round(scale * 100)}%</span>
              <button type="button" onClick={() => zoomBy(0.08)} aria-label="Увеличить"><ZoomIn className="h-4 w-4" aria-hidden /></button>
              <button type="button" onClick={fitZoom} aria-label="По размеру"><Maximize2 className="h-4 w-4" aria-hidden /></button>
            </div>
          </div>
          <div className="rvb-scroll" ref={scrollRef}>
            <div className="rvb-scaler" style={{ transform: `scale(${scale})`, marginBottom: 1123 * (scale - 1) }}>
              <div className={`a4 t-${tpl}`} dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        </section>
      </div>

      {/* Мобильные табы */}
      <div className="rvb-tabs">
        <button type="button" className={tab === "edit" ? "on" : ""} onClick={() => setTab("edit")}>
          <FileText className="h-4 w-4" aria-hidden /> Редактор
        </button>
        <button type="button" className={tab === "view" ? "on" : ""} onClick={() => setTab("view")}>
          <Check className="h-4 w-4" aria-hidden /> Просмотр
        </button>
      </div>

      {/* Drawer шаблонов */}
      <div className={`rvb-ov ${drawer ? "on" : ""}`} onClick={() => setDrawer(false)} aria-hidden={!drawer} />
      <aside className={`rvb-drawer ${drawer ? "on" : ""}`} aria-label="Выбор шаблона" aria-hidden={!drawer}>
        <div className="rvb-drawer-h">
          <div>
            <h3>Шаблоны резюме</h3>
            <p>10 макетов: от строгого ATS до современного дизайна. Превью — на ваших данных.</p>
          </div>
          <button type="button" className="rvb-ico" onClick={() => setDrawer(false)} aria-label="Закрыть"><X className="h-4 w-4" aria-hidden /></button>
        </div>
        <div className="rvb-fchips">
          {[
            ["all", "Все (10)"],
            ["safe", "✓ ATS-safe"],
            ["creative", "⚠ Креативные"],
            ["exec", "Для руководства"],
            ["first", "Без опыта"],
          ].map(([k, label]) => (
            <button type="button" key={k} className={`rvb-fchip ${filter === k ? "on" : ""}`} onClick={() => setFilter(k)}>
              {label}
            </button>
          ))}
        </div>
        <div className="rvb-dgrid" ref={gridRef}>
          {drawer &&
            filtered.map((t) => (
              <div
                key={t.id}
                className={`rvb-tcard ${t.id === tpl ? "on" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`Выбрать шаблон ${t.name}`}
                onClick={() => { setTpl(t.id); setDrawer(false); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTpl(t.id); setDrawer(false); } }}
              >
                <div className="rvb-tcard-th" aria-hidden="true">
                  <div className="rvb-mini">
                    <div className={`a4 t-${t.id}`} dangerouslySetInnerHTML={{ __html: buildResumeHtml(data, t.id) }} />
                  </div>
                </div>
                <div className="rvb-tcard-m">
                  <div>
                    <b>{t.name}</b>
                    <small>{t.desc}</small>
                  </div>
                  <span className={`rvb-badge ${t.ats === "safe" ? "safe" : "cre"}`}>
                    {t.ats === "safe" ? `✓ ${t.parse}%` : `⚠ ${t.parse}%`}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </aside>
    </div>
  );

  function renderSection(id: SectionId) {
    const p = data.personal;
    switch (id) {
      case "prof":
        return (
          <div className="rvb-fld">
            <label>
              Ваша сфера
              <select value={presetKey} onChange={(e) => applyPreset(e.target.value)}>
                <option value="">— выберите профессию —</option>
                {Object.entries(PRESETS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </label>
            <div className="rvb-tip">Подставим типовые навыки, «О себе» и готовые формулировки достижений. Всё можно изменить.</div>
          </div>
        );
      case "user":
        return (
          <>
            <div className="rvb-row3">
              <div className="rvb-fld"><label>Фамилия<input value={p.surname} onChange={(e) => patchPersonal("surname", e.target.value)} /></label></div>
              <div className="rvb-fld"><label>Имя<input value={p.name} onChange={(e) => patchPersonal("name", e.target.value)} /></label></div>
              <div className="rvb-fld"><label>Отчество<input value={p.patronymic} onChange={(e) => patchPersonal("patronymic", e.target.value)} /></label></div>
            </div>
            <div className="rvb-fld"><label>Желаемая должность<input value={p.role} onChange={(e) => patchPersonal("role", e.target.value)} /></label></div>
            <div className="rvb-fld">
              <label>Фото <span className="hint">необязательно</span><input type="file" accept="image/*" onChange={onPhoto} /></label>
              <label className="flex items-center gap-2 mt-2 text-[12.5px] font-medium cursor-pointer">
                <input type="checkbox" className="w-auto" checked={p.showPhoto !== false} onChange={(e) => patchPersonal("showPhoto", e.target.checked)} />
                Показывать фото в резюме
              </label>
              <div className="rvb-tip">Деловое фото на светлом фоне, лицо крупно. Для руководящих и клиентских позиций фото — плюс; для ATS-шаблонов лучше отключить.</div>
            </div>
            <div className="rvb-row">
              <div className="rvb-fld"><label>Город<input value={p.city} onChange={(e) => patchPersonal("city", e.target.value)} /></label></div>
              <div className="rvb-fld"><label>Телефон<input value={p.phone} onChange={(e) => patchPersonal("phone", e.target.value)} /></label></div>
            </div>
            <div className="rvb-row">
              <div className="rvb-fld"><label>Email<input value={p.email} onChange={(e) => patchPersonal("email", e.target.value)} /></label></div>
              <div className="rvb-fld"><label>Ссылка<input value={p.link} onChange={(e) => patchPersonal("link", e.target.value)} /></label></div>
            </div>
          </>
        );
      case "sum":
        return (
          <div className="rvb-fld">
            <label>Кратко о себе</label>
            <textarea
              value={data.summary}
              placeholder="Кто вы, сколько лет опыта, ключевые сильные стороны и измеримый результат."
              onChange={(e) => setData((d) => ({ ...d, summary: e.target.value }))}
            />
            {baTip}
          </div>
        );
      case "exp":
        return (
          <>
            {data.experience.map((e, i) => (
              <div className="rvb-rep" key={i}>
                <div className="rvb-rep-h">
                  <b>Опыт {i + 1}</b>
                  <button type="button" className="rvb-del" onClick={() => setData((d) => ({ ...d, experience: d.experience.filter((_, idx) => idx !== i) }))}>Удалить</button>
                </div>
                <div className="rvb-fld"><label>Должность<input value={e.position} onChange={(ev) => updateExp(i, "position", ev.target.value)} /></label></div>
                <div className="rvb-row">
                  <div className="rvb-fld"><label>Компания<input value={e.company} onChange={(ev) => updateExp(i, "company", ev.target.value)} /></label></div>
                  <div className="rvb-fld"><label>Период<input value={e.period} onChange={(ev) => updateExp(i, "period", ev.target.value)} placeholder="03.2021 — н.в." /></label></div>
                </div>
                <div className="rvb-fld">
                  <label>Обязанности и достижения <span className="hint">— по одному в строке</span></label>
                  <textarea value={e.bullets.join("\n")} onChange={(ev) => updateBullets(i, ev.target.value)} />
                  {baTip}
                </div>
              </div>
            ))}
            <button type="button" className="rvb-add" onClick={() => setData((d) => ({ ...d, experience: [...d.experience, { company: "", position: "", period: "", bullets: [] }] }))}>
              <Plus className="inline h-3.5 w-3.5" aria-hidden /> Добавить опыт
            </button>
          </>
        );
      case "edu":
        return (
          <>
            {data.education.map((e, i) => (
              <div className="rvb-rep" key={i}>
                <div className="rvb-rep-h">
                  <b>Образование {i + 1}</b>
                  <button type="button" className="rvb-del" onClick={() => setData((d) => ({ ...d, education: d.education.filter((_, idx) => idx !== i) }))}>Удалить</button>
                </div>
                <div className="rvb-fld"><label>Учебное заведение<input value={e.institution} onChange={(ev) => updateEdu(i, "institution", ev.target.value)} /></label></div>
                <div className="rvb-row">
                  <div className="rvb-fld"><label>Специальность<input value={e.field} onChange={(ev) => updateEdu(i, "field", ev.target.value)} /></label></div>
                  <div className="rvb-fld"><label>Степень<input value={e.degree} onChange={(ev) => updateEdu(i, "degree", ev.target.value)} /></label></div>
                </div>
                <div className="rvb-row">
                  <div className="rvb-fld"><label>Год начала<input value={e.start} onChange={(ev) => updateEdu(i, "start", ev.target.value)} /></label></div>
                  <div className="rvb-fld"><label>Год окончания<input value={e.end} onChange={(ev) => updateEdu(i, "end", ev.target.value)} /></label></div>
                </div>
              </div>
            ))}
            <button type="button" className="rvb-add" onClick={() => setData((d) => ({ ...d, education: [...d.education, { institution: "", field: "", degree: "", start: "", end: "" }] }))}>
              <Plus className="inline h-3.5 w-3.5" aria-hidden /> Добавить образование
            </button>
          </>
        );
      case "sk":
        return (
          <>
            {([
              ["hard", "Hard skills — профессиональные"],
              ["soft", "Soft skills — личные качества"],
              ["tools", "Инструменты и технологии"],
            ] as Array<[keyof ResumeData["skills"], string]>).map(([cat, label]) => (
              <div className="rvb-chgrp" key={cat}>
                <label>{label}</label>
                <div className="rvb-chwrap">
                  {data.skills[cat].map((x, i) => (
                    <span className="rvb-chip" key={`${x}-${i}`}>
                      {x}
                      <button type="button" onClick={() => removeSkill(cat, i)} aria-label={`Удалить ${x}`}>×</button>
                    </span>
                  ))}
                  <input
                    className="rvb-chadd"
                    aria-label="Добавить навык"
                    placeholder="Добавить и нажать Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(cat, e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </>
        );
      case "lg":
        return (
          <>
            {data.languages.map((l, i) => (
              <div className="rvb-rep" key={i}>
                <div className="rvb-rep-h">
                  <b>Язык {i + 1}</b>
                  <button type="button" className="rvb-del" onClick={() => setData((d) => ({ ...d, languages: d.languages.filter((_, idx) => idx !== i) }))}>Удалить</button>
                </div>
                <div className="rvb-row">
                  <div className="rvb-fld"><label>Язык<input value={l.name} onChange={(ev) => updateLang(i, "name", ev.target.value)} /></label></div>
                  <div className="rvb-fld">
                    <label>
                      Уровень
                      <select value={l.level} onChange={(ev) => updateLang(i, "level", ev.target.value)}>
                        {LEVELS.map((x) => (<option key={x} value={x}>{x}</option>))}
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="rvb-add" onClick={() => setData((d) => ({ ...d, languages: [...d.languages, { name: "", level: "B1" }] }))}>
              <Plus className="inline h-3.5 w-3.5" aria-hidden /> Добавить язык
            </button>
          </>
        );
    }
  }
}
