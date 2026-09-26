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
  X,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  FileDown,
  Loader2,
  ChevronRight,
  GripVertical,
  ImageIcon,
} from "lucide-react";
import { RESUME_CSS } from "@/lib/resume/resumeCss";
import { BUILDER_CSS } from "@/lib/resume/builderCss";
import { PRESETS, PHRASES, SAMPLE_RESUME, TEMPLATES, TEMPLATE_META } from "@/lib/resume/data";
import { buildResumeDocHtml, buildResumeHtml, countNumericBullets, fullName, hardSkills } from "@/lib/resume/render";
// pdf-lib подгружается лениво при экспорте (см. exportPdfFile) — чтобы не раздувать бандл страницы
import { saveAs } from "file-saver";
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
  const [openSec, setOpenSec] = useState<SectionId | null>("user");
  const [undo, setUndo] = useState<{ label: string; restore: () => void } | null>(null);
  const undoTimer = useRef<number | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [filter, setFilter] = useState("all");
  const [qOpen, setQOpen] = useState(false);
  const [scale, setScale] = useState(0.62);
  const [manual, setManual] = useState(false);
  const fitRef = useRef(0.62);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const a4Ref = useRef<HTMLDivElement | null>(null);
  const qWrapRef = useRef<HTMLDivElement | null>(null);
  const [docH, setDocH] = useState(1123);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [tab, setTab] = useState<"edit" | "view">("edit");
  const [loaded, setLoaded] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<HTMLDivElement | null>(null);
  const [appH, setAppH] = useState<string | null>(null);

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

  // Реальная высота документа — чтобы обёртка совпадала с визуальным размером
  // (иначе масштабированный A4 вызывает лишнюю прокрутку).
  useEffect(() => {
    const el = a4Ref.current;
    if (!el) return;
    const measure = () => setDocH(el.offsetHeight || 1123);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data, tpl]);

  // Высота рабочей области = окно минус фактическое смещение (заголовок сайта),
  // чтобы не было лишней прокрутки страницы и «скачков» на мобильных.
  useEffect(() => {
    const compute = () => {
      if (window.innerWidth <= 1080) { setAppH(null); return; }
      const el = appRef.current;
      if (!el) return;
      const absoluteTop = el.getBoundingClientRect().top + window.scrollY;
      setAppH(`${Math.max(420, Math.round(window.innerHeight - absoluteTop))}px`);
    };
    const timer = window.setTimeout(compute, 60);
    window.addEventListener("resize", compute);
    return () => { window.clearTimeout(timer); window.removeEventListener("resize", compute); };
  }, []);

  // Esc закрывает drawer и поповер качества; клик вне поповера — тоже.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setDrawer(false); setQOpen(false); } };
    const onDown = (e: MouseEvent) => {
      if (qWrapRef.current && !qWrapRef.current.contains(e.target as Node)) setQOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

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

  // Настоящий PDF: A4, текстовый слой (не картинка), повторяет раскладку шаблона.
  const exportPdfFile = async () => {
    setPdfBusy(true);
    try {
      const { renderResumePdf } = await import("@/lib/resume/resumePdf");
      const blob = await renderResumePdf(data, tpl);
      saveAs(blob, `Резюме — ${fullName(data) || "без имени"}.pdf`);
    } catch (err) {
      console.error("[resume] pdf", err);
      window.alert("Не удалось сформировать PDF. Попробуйте ещё раз.");
    } finally {
      setPdfBusy(false);
    }
  };

  const showUndo = (label: string, restore: () => void) => {
    setUndo({ label, restore });
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndo(null), 6000);
  };
  const deleteExp = (i: number) => {
    const item = data.experience[i];
    setData((d) => ({ ...d, experience: d.experience.filter((_, idx) => idx !== i) }));
    showUndo("Запись об опыте удалена", () =>
      setData((d) => { const a = [...d.experience]; a.splice(i, 0, item); return { ...d, experience: a }; })
    );
  };
  const deleteEdu = (i: number) => {
    const item = data.education[i];
    setData((d) => ({ ...d, education: d.education.filter((_, idx) => idx !== i) }));
    showUndo("Запись об образовании удалена", () =>
      setData((d) => { const a = [...d.education]; a.splice(i, 0, item); return { ...d, education: a }; })
    );
  };
  const deleteLang = (i: number) => {
    const item = data.languages[i];
    setData((d) => ({ ...d, languages: d.languages.filter((_, idx) => idx !== i) }));
    showUndo("Язык удалён", () =>
      setData((d) => { const a = [...d.languages]; a.splice(i, 0, item); return { ...d, languages: a }; })
    );
  };

  // Скачивание в DOC (Word-совместимый HTML): редактируемый документ.
  const exportDoc = () => {
    const html = buildResumeDocHtml(data, tpl);
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Резюме — ${fullName(data) || "без имени"}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
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

      <div className="rvb-app" ref={appRef} style={appH ? { height: appH } : undefined}>
        {/* Форма */}
        <aside className={`rvb-panel ${tab === "edit" ? "mobile-on" : ""}`}>
          <div className="rvb-panel-head">
            <h2>Заполните резюме</h2>
            <p>Готовность {qPct}% · данные сохраняются в браузере</p>
            <div className="rvb-progress"><i style={{ width: `${qPct}%` }} /></div>
          </div>
          <nav className="rvb-nav">
            {ACCORDION.map(({ id, title, icon: Icon }) => {
              const state = doneState(id);
              const isOpen = openSec === id;
              return (
                <div className="rvb-acc" key={id}>
                  <button
                    type="button"
                    className={`rvb-acc-h ${isOpen ? "on" : ""}`}
                    onClick={() => setOpenSec(isOpen ? null : id)}
                    aria-expanded={isOpen}
                  >
                    <span className="rvb-ic"><Icon className="h-4 w-4" aria-hidden /></span>
                    <span className="rvb-acc-t">
                      <b>{title}</b>
                      <small>{subtitle(id)}</small>
                    </span>
                    <span className={`rvb-st ${state}`}>{state === "done" ? "✓" : ""}</span>
                    <ChevronRight className="rvb-chev h-4 w-4" aria-hidden />
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
            <div className="rvb-qwrap" ref={qWrapRef}>
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
                  <h3>Готовность резюме</h3>
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
            <button type="button" className="rvb-btn rvb-btn-o" onClick={exportDoc} title="Скачать в DOC (Word)">
              <FileText className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">DOC</span>
            </button>
            <button type="button" className="rvb-btn rvb-btn-p" onClick={() => { void exportPdfFile(); }} title="Скачать резюме в PDF" disabled={pdfBusy}>
              {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FileDown className="h-4 w-4" aria-hidden />}
              <span className="hidden sm:inline">{pdfBusy ? "Готовим…" : "Скачать PDF"}</span>
            </button>
            <div className="rvb-zoom">
              <button type="button" onClick={() => zoomBy(-0.08)} aria-label="Уменьшить"><ZoomOut className="h-4 w-4" aria-hidden /></button>
              <span className="zv">{Math.round(scale * 100)}%</span>
              <button type="button" onClick={() => zoomBy(0.08)} aria-label="Увеличить"><ZoomIn className="h-4 w-4" aria-hidden /></button>
              <button type="button" onClick={fitZoom} aria-label="По размеру"><Maximize2 className="h-4 w-4" aria-hidden /></button>
            </div>
          </div>
          <div className="rvb-scroll" ref={scrollRef} role="region" aria-label="Предпросмотр резюме" tabIndex={0}>
            <div className="rvb-scaler" style={{ width: 794 * scale, height: docH * scale }}>
              <div
                ref={a4Ref}
                className={`a4 t-${tpl}`}
                style={{ transformOrigin: "top left", transform: `scale(${scale})` }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
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
      <aside className={`rvb-drawer ${drawer ? "on" : ""}`} aria-label="Выбор шаблона" aria-hidden={!drawer} inert={!drawer}>
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
        <div className="rvb-dgrid" ref={gridRef} role="group" aria-label="Шаблоны резюме" tabIndex={0}>
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

      {undo && (
        <div className="rvb-undo on" role="status">
          <span>{undo.label}</span>
          <button type="button" onClick={() => { undo.restore(); setUndo(null); }}>Отменить</button>
        </div>
      )}
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
              <label>Фото <span className="hint">необязательно</span></label>
              <div className="rvb-photo-row">
                <span className="rvb-photo-thumb" style={p.photo ? { backgroundImage: `url(${p.photo})` } : undefined}>
                  {p.photo ? null : <ImageIcon className="h-5 w-5" aria-hidden />}
                </span>
                <label className="rvb-btn-chip" style={{ cursor: "pointer" }}>
                  Загрузить
                  <input type="file" accept="image/*" onChange={onPhoto} className="sr-only" />
                </label>
                {p.photo ? (
                  <button type="button" className="rvb-btn-chip danger" onClick={() => patchPersonal("photo", "")}>Убрать</button>
                ) : null}
              </div>
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
                <span className="rvb-rep-drag" aria-hidden><GripVertical className="h-4 w-4" /></span>
                <div className="rvb-rep-body">
                  <div className="rvb-rep-h">
                    <b>Опыт {i + 1}</b>
                    <button type="button" className="rvb-del" onClick={() => deleteExp(i)}>Удалить</button>
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
                <span className="rvb-rep-drag" aria-hidden><GripVertical className="h-4 w-4" /></span>
                <div className="rvb-rep-body">
                  <div className="rvb-rep-h">
                    <b>Образование {i + 1}</b>
                    <button type="button" className="rvb-del" onClick={() => deleteEdu(i)}>Удалить</button>
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
                <span className="rvb-rep-drag" aria-hidden><GripVertical className="h-4 w-4" /></span>
                <div className="rvb-rep-body">
                  <div className="rvb-rep-h">
                    <b>Язык {i + 1}</b>
                    <button type="button" className="rvb-del" onClick={() => deleteLang(i)}>Удалить</button>
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
