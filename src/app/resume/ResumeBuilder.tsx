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
  Check,
  FileDown,
  Loader2,
  ChevronRight,
  GripVertical,
  ImageIcon,
} from "lucide-react";
import { RESUME_CSS } from "@/lib/resume/resumeCss";
import { BUILDER_CSS } from "@/lib/resume/builderCss";
import { ACCENT_PALETTES, PRESETS, PHRASES, SAMPLE_RESUME, TEMPLATES, TEMPLATE_META } from "@/lib/resume/data";
import { buildResumeCardHtml, buildResumeDocHtml, buildResumePreviewHtml, countNumericBullets, fullName, hardSkills } from "@/lib/resume/render";
import { downloadResumeDocx } from "@/lib/resume/resumeDocx";
// pdf-lib подгружается лениво при экспорте (см. exportPdfFile) — чтобы не раздувать бандл страницы
import { saveAs } from "file-saver";
import type { ResumeData, ResumeExperience, ResumeLanguage, TemplateId } from "@/lib/resume/types";

const LS_DATA = "dogovorResumeData";
const LS_TPL = "dogovorResumeTpl";
const LS_ACCENT = "dogovorResumeAccent";
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
  const volume =
    (data.summary || "").length +
    data.experience.reduce((n, e) => n + (e.position || "").length + (e.company || "").length + (e.bullets ?? []).join(" ").length, 0) +
    data.education.reduce((n, e) => n + (e.institution || "").length + (e.field || "").length, 0);
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
    { label: "Объём — 1–2 страницы (не переполнено)", ok: volume < 6000 },
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
  const [tpl, setTpl] = useState<TemplateId>("executive-navy");
  const [accent, setAccent] = useState<string | null>(null);
  const [presetKey, setPresetKey] = useState("");
  const [openSec, setOpenSec] = useState<SectionId | null>("user");
  const [undo, setUndo] = useState<{ label: string; restore: () => void } | null>(null);
  const undoTimer = useRef<number | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [filter, setFilter] = useState("all");
  const [qOpen, setQOpen] = useState(false);
  const [scale, setScale] = useState(0.62);
  // Режим зума: по умолчанию «по ширине» (~76% при сцене 652px), а не «лист»
  // (50%): текст 13.5px→10px читаемее, чем 6.7px (замер аудита 30.09.2026, №7).
  // aria-pressed на кнопках отражает mode, а не «нажат ли ручной зум».
  type ZoomMode = "page" | "width" | "actual" | "custom";
  const [mode, setMode] = useState<ZoomMode>("width");
  const fitRef = useRef(0.62);
  const fitWRef = useRef(0.62);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sliceRef = useRef<HTMLDivElement | null>(null);
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
      const acc = localStorage.getItem(LS_ACCENT);
      if (acc) setAccent(acc);
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
        if (accent) localStorage.setItem(LS_ACCENT, accent);
        else localStorage.removeItem(LS_ACCENT);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [data, tpl, loaded, accent]);

  // Масштаб превью. Не «вписать лист целиком по высоте»: A4 = 1:1.414, поэтому
  // такая подгонка давала 53% на desktop и 38% на mobile — текст 11.5px
  // превращался в 6px/4.4px и был нечитаем (замер 29.09.2026).
  //
  // Теперь три режима (по исследованию resume builders):
  //   fit  — лист целиком, но с потолком 0.695 (=780/1123): на широком мониторе
  //          «по ширине» дал бы 3.1x, что бессмысленно;
  //   100  — пиксель-в-пиксель (793.7x1122.5px);
  //   шаг  — фиксированные ступени 25/50/75/100/125/150/200%, без дробей.
  const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2] as const;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const compute = () => {
      // Отступы .rvb-scroll. На мобильных padding-bottom:200px — это место ПОД
      // фиксированную панель табов, а не полезная высота: вычитать его из
      // clientHeight нельзя, иначе масштаб падал до 20% (замер 29.09.2026).
      // Поэтому берём только верхний/боковой отступы, а нижний резерв
      // отсекаем по факту: реальная высота = clientHeight минус «хвост» снизу.
      const cs = getComputedStyle(el);
      const padTop = parseFloat(cs.paddingTop) || 0;
      const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const padBottom = parseFloat(cs.paddingBottom) || 0;
      // Мобильный резерв под табы: 200px в media-query, 56px — высота таб-бара.
      const isNarrow = window.innerWidth <= 1080;
      const reserve = isNarrow ? Math.min(padBottom, 200) : padBottom;
      const availW = el.clientWidth - padX;
      const availH = el.clientHeight - padTop - reserve;
      // Лист A4 всегда одинаковой высоты (1123px): «Лист» вписывает ОДИН
      // лист целиком. Раньше замер шёл по полной высоте контента, и на
      // многостраничном документе масштаб падал до пола 0.2 (20%).
      const fit = Math.max(0.2, Math.min(0.695, Math.min(availW / 794, availH / 1123)));
      fitRef.current = fit;
      // Режим «по ширине»: лист занимает всю ширину сцены. Нужен на узких
      // экранах: при 430px вся высота сцены за вычетом резерва под табы
      // (445−20−200=225px) в лист A4 высотой 1123px физически не влезает —
      // «целый лист» давал 20% и нечитаемый текст.
      const byWidth = Math.max(0.2, Math.min(1.25, availW / 794));
      fitWRef.current = byWidth;
      if (mode === "page") setScale(isNarrow ? byWidth : fit);
      else if (mode === "width") setScale(byWidth);
      // actual/custom: масштаб не трогаем — его задаёт пользователь.
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode, docH, openSec, tab]);

  // Переход по шкале ступеней: вверх — ближайшая большая, вниз — меньшая.
  const stepZoom = (dir: 1 | -1) => {
    setMode("custom");
    setScale((s) => {
      const next = dir > 0 ? ZOOM_STEPS.find((z) => z > s + 0.001) : [...ZOOM_STEPS].reverse().find((z) => z < s - 0.001);
      return next ?? s;
    });
  };
  const fitZoom = () => {
    setMode("page");
    // На узких экранах «Лист» = по ширине: целиком A4 в 225px не влезает,
    // и подгонка по высоте убивает читаемость (20%).
    setScale(window.innerWidth <= 1080 ? fitWRef.current : fitRef.current);
  };
  const fitWidthZoom = () => {
    setMode("width");
    setScale(fitWRef.current);
  };
  const actualZoom = () => {
    setMode("actual");
    setScale(1);
  };

  // Реальная высота документа — чтобы обёртка совпадала с визуальным размером
  // (иначе масштабированный A4 вызывает лишнюю прокрутку). Меряем первый
  // .rvb-slice (absolute-клон контента): его offsetHeight = высота контента.
  useEffect(() => {
    const el = sliceRef.current;
    if (!el) return;
    const measure = () => setDocH(el.offsetHeight || 1123);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data, tpl]);

  // Число физических листов A4 в превью (разрывы страниц видны как зазоры
  // между листами) и высота всей ленты в координатах листа (без масштаба).
  const pages = Math.max(1, Math.ceil(docH / 1123));
  const ribbonH = 1123 * pages + 16 * (pages - 1);

  // Высота рабочей области. Сайт — app-shell: <div class="flex h-screen overflow-hidden">
  // c <main class="overflow-y-auto">, поэтому window.innerHeight НЕ равно высоте
  // области просмотра #studio. Раньше считалось `window.innerHeight - absoluteTop`
  // и давало 680px вместо доступных ~936px (замер 29.09.2026: main.clientHeight=936).
  // Теперь ищем ближайший прокручиваемый предок и меряем его реальную высоту.
  useEffect(() => {
    const compute = () => {
      if (window.innerWidth <= 1080) { setAppH(null); return; }
      const el = appRef.current;
      if (!el) return;
      // Ближайший контейнер с вертикальным скроллом (в app-shell это <main>).
      let host: HTMLElement | null = el.parentElement;
      while (host) {
        const oy = getComputedStyle(host).overflowY;
        if (oy === "auto" || oy === "scroll") break;
        host = host.parentElement;
      }
      const viewportH = host?.clientHeight || window.innerHeight;
      // Прокрутка НЕ влияет на высоту: считаем в координатах содержимого.
      // Высота студии = высота окна скроллера минус вертикальные отступы самой
      // секции #studio (py-12 = 96px) и 24px «воздуха». Так при прокрутке
      // секции к верху окна лист занимает ровно один экран.
      const secPad = host ? (() => {
        const cs = getComputedStyle(el.closest("section") || el);
        return parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      })() : 0;
      const avail = Math.round(viewportH - secPad - 24);
      setAppH(`${Math.max(560, avail)}px`);
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
        // Компактные превью (rc-*) уже в размере миниатюры — scale не нужен.
        if (mini.querySelector(".rc")) {
          mini.style.transform = "";
          mini.style.width = "100%";
          return;
        }
        const s = th.clientWidth / 794;
        mini.style.transformOrigin = "top left";
        mini.style.transform = `scale(${s})`;
        mini.style.width = "794px";
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [drawer, filter, data, tpl]);

  // Предпросмотр — не сам документ: заголовки заменяются на div, иначе <h1>
  // из резюме попадает в DOM страницы (аудит 28.09.2026 — 26 <h1> на /resume).
  // Выгрузка PDF/DOC использует buildResumeHtml/buildResumeDocHtml без изменений.
  const html = useMemo(
    () => buildResumePreviewHtml(data, tpl, accent ?? undefined),
    [data, tpl, accent]
  );
  const quality = useMemo(() => computeQuality(data), [data]);
  const qPct = Math.round((quality.filter((c) => c.ok).length / quality.length) * 100);

  const patchPersonal = (key: keyof ResumeData["personal"], value: string | boolean) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [key]: value } }));

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Сжимаем фото до 512px (JPEG 0.85): иначе сырой dataURL на мегабайты
    // переполняет localStorage и ломает превью/экспорт.
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const max = 512;
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * s));
        const h = Math.max(1, Math.round(img.height * s));
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        cv.getContext("2d")?.drawImage(img, 0, 0, w, h);
        patchPersonal("photo", cv.toDataURL("image/jpeg", 0.85));
      } catch {
        const reader = new FileReader();
        reader.onload = () => { const r = reader.result; if (typeof r === "string") patchPersonal("photo", r); };
        reader.readAsDataURL(file);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = () => { const r = reader.result; if (typeof r === "string") patchPersonal("photo", r); };
      reader.readAsDataURL(file);
    };
    img.src = url;
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
    if (key === "custom") {
      // Остаёмся в разделе «Профессия» — ниже показано поле для своей должности.
      return;
    }
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
      const blob = await renderResumePdf(data, tpl, accent ?? undefined);
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
  // Настоящий .docx (OOXML), а не HTML с расширением .doc.
  // Раньше здесь был Blob(["\ufeff", html], {type:"application/msword"}) —
  // это не документ Word: Word открывал его как HTML, но и .doc, и .docx
  // файл не являлись, а обещание "PDF и DOCX" на сайте не выполнялось.
  // Шапка/подвал с брендом сайта намеренно не добавляются — документ
  // получает кандидат, а не мы. Подробности в src/lib/resume/resumeDocx.ts.
  const exportDoc = async () => {
    const html = buildResumeDocHtml(data, tpl, accent ?? undefined);
    await downloadResumeDocx(html, `Резюме — ${fullName(data) || "без имени"}`);
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
        return presetKey === "custom"
          ? data.personal.role || "Свой вариант"
          : presetKey
            ? PRESETS[presetKey].label
            : "Выберите — подставим подсказки";
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
            <button
              type="button"
              className="rvb-btn rvb-btn-o"
              onClick={() => void exportDoc()}
              title="Скачать в DOCX (Word): офисная вёрстка макета — шрифты Arial/Times, без графики экранного превью"
            >
              <FileText className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">DOCX</span>
            </button>
            <button type="button" className="rvb-btn rvb-btn-p" onClick={() => { void exportPdfFile(); }} title="Скачать резюме в PDF — печатное качество A4, вёрстка может незначительно отличаться от превью" disabled={pdfBusy}>
              {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FileDown className="h-4 w-4" aria-hidden />}
              <span className="hidden sm:inline">{pdfBusy ? "Готовим…" : "Скачать PDF"}</span>
            </button>
            <div className="rvb-zoom" role="group" aria-label="Масштаб предпросмотра">
              <div className="rvb-zoomset">
                <button type="button" onClick={fitZoom} aria-pressed={mode === "page"} title="Целый лист A4">Лист</button>
                <button type="button" onClick={fitWidthZoom} aria-pressed={mode === "width"} title="По ширине окна">Ширина</button>
                <button type="button" onClick={actualZoom} aria-pressed={mode === "actual"} title="Реальный размер 100%">100%</button>
              </div>
              <div className="rvb-zoomstep">
                <button type="button" onClick={() => stepZoom(-1)} aria-label="Уменьшить масштаб"><ZoomOut className="h-4 w-4" aria-hidden /></button>
                <span className="zv" aria-live="polite">{Math.round(scale * 100)}%</span>
                <button type="button" onClick={() => stepZoom(1)} aria-label="Увеличить масштаб"><ZoomIn className="h-4 w-4" aria-hidden /></button>
              </div>
            </div>
          </div>
          <div className="rvb-scroll" ref={scrollRef} role="region" aria-label="Предпросмотр резюме" tabIndex={0}>
            <div className="rvb-scaler" style={{ width: 794 * scale, height: ribbonH * scale }}>
              <div className="rvb-pages" style={{ transform: `scale(${scale})` }}>
                {Array.from({ length: pages }, (_, i) => (
                  <div key={i} className={`a4 t-${tpl}`}>
                    <div
                      ref={i === 0 ? sliceRef : undefined}
                      className="rvb-slice"
                      style={{ top: -1123 * i }}
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rvb-pagelabel" aria-hidden>
            <span className="rvb-sheetname">{TEMPLATE_META[tpl]?.name}</span>
            <span className="rvb-dims">A4 · 210 × 297 мм{pages > 1 ? ` · ${pages} стр.` : " · 1 стр."}</span>
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
            <p>{TEMPLATES.length} макетов: от строгого ATS до современного дизайна. Превью — на ваших данных. Файлы PDF и DOCX набираются офисными шрифтами (Arial/Times), поэтому вёрстка может незначительно отличаться от экранного превью.</p>
          </div>
          <button type="button" className="rvb-ico" onClick={() => setDrawer(false)} aria-label="Закрыть"><X className="h-4 w-4" aria-hidden /></button>
        </div>
        <div className="rvb-fchips">
          {[
            ["all", `Все (${TEMPLATES.length})`],
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
        <div className="rvb-accent-box">
          <div className="rvb-accent-h">Акцент оформления</div>
          <div className="rvb-accent-row">
            {ACCENT_PALETTES.map((c) => (
              <button
                key={c.hex}
                type="button"
                className={`rvb-accent-dot ${accent === c.hex ? "on" : ""}`}
                style={{ background: c.hex }}
                title={c.name}
                aria-label={`Акцент: ${c.name}`}
                aria-pressed={accent === c.hex}
                onClick={() => setAccent(accent === c.hex ? null : c.hex)}
              >
                {accent === c.hex ? "✓" : ""}
              </button>
            ))}
            <button
              type="button"
              className={`rvb-accent-auto ${accent === null ? "on" : ""}`}
              aria-pressed={accent === null}
              onClick={() => setAccent(null)}
            >
              Цвет шаблона
            </button>
          </div>
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
                    <div dangerouslySetInnerHTML={{ __html: buildResumeCardHtml(data, t.id, accent ?? undefined) }} />
                  </div>
                </div>
                <div className="rvb-tcard-m">
                  <div>
                    <b className="rvb-tname">
                      <i className="rvb-dot" style={{ background: t.color }} aria-hidden />
                      {t.name}
                    </b>
                    <small>
                      <span className="rvb-tcard-cat">{t.category}</span>
                      {t.desc}
                      {t.badge ? <em className="rvb-tcard-badge">{t.badge}</em> : null}
                    </small>
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
                <option value="custom">Свой вариант — впишу сам</option>
              </select>
            </label>
            {presetKey === "custom" && (
              <label style={{ marginTop: 10 }}>
                Ваша профессия / должность
                <input
                  value={p.role}
                  maxLength={80}
                  placeholder="Например: Product-дизайнер"
                  onChange={(e) => patchPersonal("role", e.target.value)}
                />
              </label>
            )}
            <div className="rvb-tip">
              {presetKey === "custom"
                ? "Впишите должность — остальные разделы заполните вручную. Подсказки по формулировкам доступны в блоках ниже."
                : "Подставим типовые навыки, «О себе» и готовые формулировки достижений. Всё можно изменить."}
            </div>
          </div>
        );
      case "user":
        return (
          <>
            <div className="rvb-row3">
              <div className="rvb-fld"><label>Фамилия<input value={p.surname} maxLength={40} onChange={(e) => patchPersonal("surname", e.target.value)} /></label></div>
              <div className="rvb-fld"><label>Имя<input value={p.name} maxLength={40} onChange={(e) => patchPersonal("name", e.target.value)} /></label></div>
              <div className="rvb-fld"><label>Отчество<input value={p.patronymic} maxLength={40} onChange={(e) => patchPersonal("patronymic", e.target.value)} /></label></div>
            </div>
            <div className="rvb-fld"><label>Желаемая должность<input value={p.role} maxLength={80} onChange={(e) => patchPersonal("role", e.target.value)} /></label></div>
            <div className="rvb-fld">
              <label>Фото <span className="hint">необязательно</span></label>
              <div className="rvb-photo-row">
                <span className="rvb-photo-thumb" aria-hidden="true" style={p.photo ? { backgroundImage: `url(${p.photo})` } : undefined}>
                  {p.photo ? null : <ImageIcon className="h-5 w-5" aria-hidden />}
                </span>
                <div className="rvb-photo-actions">
                  <label className="rvb-btn-chip" style={{ cursor: "pointer" }}>
                    {p.photo ? "Заменить фото" : "Загрузить фото"}
                    <input type="file" accept="image/*" onChange={onPhoto} className="sr-only" />
                  </label>
                  {p.photo ? (
                    <button type="button" className="rvb-btn-chip danger" onClick={() => patchPersonal("photo", "")}>Убрать</button>
                  ) : null}
                </div>
              </div>
              <label className="rvb-switch">
                <input type="checkbox" checked={p.showPhoto !== false} onChange={(e) => patchPersonal("showPhoto", e.target.checked)} />
                <span className="rvb-switch-track" aria-hidden="true"><span className="rvb-switch-dot" /></span>
                <span>Показывать фото в резюме</span>
              </label>
              <div className="rvb-tip">Деловое фото на светлом фоне, лицо крупно. Для руководящих и клиентских позиций фото — плюс; для ATS-шаблонов лучше отключить.</div>
            </div>
            <div className="rvb-row">
              <div className="rvb-fld"><label>Город<input value={p.city} maxLength={40} onChange={(e) => patchPersonal("city", e.target.value)} /></label></div>
              <div className="rvb-fld"><label>Телефон<input value={p.phone} maxLength={25} onChange={(e) => patchPersonal("phone", e.target.value)} /></label></div>
            </div>
            <div className="rvb-row">
              <div className="rvb-fld"><label>Email<input value={p.email} maxLength={80} onChange={(e) => patchPersonal("email", e.target.value)} /></label></div>
              <div className="rvb-fld"><label>Ссылка<input value={p.link} maxLength={120} onChange={(e) => patchPersonal("link", e.target.value)} /></label></div>
            </div>
          </>
        );
      case "sum":
        return (
          <div className="rvb-fld">
            <label>Кратко о себе</label>
            <textarea
              value={data.summary}
              maxLength={700}
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
                  <div className="rvb-fld"><label>Должность<input value={e.position} maxLength={80} onChange={(ev) => updateExp(i, "position", ev.target.value)} /></label></div>
                  <div className="rvb-row">
                    <div className="rvb-fld"><label>Компания<input value={e.company} maxLength={80} onChange={(ev) => updateExp(i, "company", ev.target.value)} /></label></div>
                    <div className="rvb-fld"><label>Период<input value={e.period} maxLength={30} onChange={(ev) => updateExp(i, "period", ev.target.value)} placeholder="03.2021 — н.в." /></label></div>
                  </div>
                  <div className="rvb-fld">
                    <label>Обязанности и достижения <span className="hint">— по одному в строке</span></label>
                    <textarea value={e.bullets.join("\n")} maxLength={2000} onChange={(ev) => updateBullets(i, ev.target.value)} />
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
                  <div className="rvb-fld"><label>Учебное заведение<input value={e.institution} maxLength={100} onChange={(ev) => updateEdu(i, "institution", ev.target.value)} /></label></div>
                  <div className="rvb-row">
                    <div className="rvb-fld"><label>Специальность<input value={e.field} maxLength={100} onChange={(ev) => updateEdu(i, "field", ev.target.value)} /></label></div>
                    <div className="rvb-fld"><label>Степень<input value={e.degree} maxLength={60} onChange={(ev) => updateEdu(i, "degree", ev.target.value)} /></label></div>
                  </div>
                  <div className="rvb-row">
                    <div className="rvb-fld"><label>Год начала<input value={e.start} maxLength={12} onChange={(ev) => updateEdu(i, "start", ev.target.value)} /></label></div>
                    <div className="rvb-fld"><label>Год окончания<input value={e.end} maxLength={12} onChange={(ev) => updateEdu(i, "end", ev.target.value)} /></label></div>
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
                    maxLength={40}
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
                    <div className="rvb-fld"><label>Язык<input value={l.name} maxLength={40} onChange={(ev) => updateLang(i, "name", ev.target.value)} /></label></div>
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
