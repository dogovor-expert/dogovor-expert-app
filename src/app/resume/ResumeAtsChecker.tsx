"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ATS_RULES = [
  {
    title: "Одноколоночная вёрстка без таблиц",
    desc: "Парсеры HeadHunter, SuperJob и Workday корректно читают линейный поток текста: опыт, навыки и контакты не теряются при импорте.",
  },
  {
    title: "Машинные шрифты и стандартные поля",
    desc: "Используются безопасные гарнитуры и привычные заголовки разделов — робот понимает структуру без ручной разметки.",
  },
  {
    title: "Ключевые слова из вакансии",
    desc: "Навыки и термины выносятся в отдельный блок — ATS сопоставляет их с требованиями вакансии и повышает релевантность отклика.",
  },
  {
    title: "Текстовый слой в PDF вместо картинки",
    desc: "Экспорт идёт с настоящим текстовым слоем: резюме индексируется поиском и распознаётся сканерами без OCR.",
  },
];

const SAMPLE_TRANSFORMS = [
  {
    role: "Менеджер по продажам / Руководитель",
    weak: "Занимался холодными звонками, вел базу клиентов в CRM и выполнял поручения руководства.",
    strong:
      "Привлек 38 новых корпоративных клиентов с чеком от 1.5 млн руб, перевыполнив годовой план на 124% и сократив цикл сделки на 18 дней.",
  },
  {
    role: "Юрист / Комплаенс",
    weak: "Составлял договоры, ходил в суды и проверял документы контрагентов.",
    strong:
      "Успешно защитил интересы компании в 14 арбитражных спорах на сумму 86 млн руб и внедрил систему автоматической проверки контрагентов по 152-ФЗ.",
  },
  {
    role: "Разработчик / Инженер",
    weak: "Писал код на React и исправлял найденные баги в интерфейсе.",
    strong:
      "Спроектировал и запустил ключевой модуль личного кабинета с MAU 140 000+, сократив время загрузки страницы на 46% (LCP 1.1s).",
  },
];

export default function ResumeAtsChecker() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const activeExample = SAMPLE_TRANSFORMS[selectedExample];

  const handleCopy = (text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerImprove = (idx: number) => {
    setSelectedExample(idx);
    setIsImproving(true);
    setTimeout(() => {
      setIsImproving(false);
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* 1. ATS Compliance Rules */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Соответствие стандартам ATS 2026</h3>
              <p className="text-xs text-slate-500">
                Гарантированный проход через роботов HeadHunter и SuperJob
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
            98 / 100
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {ATS_RULES.map((rule) => (
            <div
              key={rule.title}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 sm:text-sm">{rule.title}</div>
                <div className="mt-1 text-xs leading-relaxed text-slate-500">{rule.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            Все шаблоны протестированы в HH.ru и Taleo
          </span>
          <span className="text-[11px] text-slate-500">Проверка пройдена</span>
        </div>
      </div>

      {/* 2. AI Resume Enhancer (Weak -> Strong transformer) */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 border-b border-indigo-100/80 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-600/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">AI-Усилитель текста резюме</h3>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                Метод STAR
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Превращает пассивные обязанности в сильные оцифрованные достижения
            </p>
          </div>
        </div>

        {/* Example tabs */}
        <div className="mt-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Примеры трансформации по сферам:
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {SAMPLE_TRANSFORMS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTriggerImprove(idx)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  selectedExample === idx
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                )}
              >
                {item.role.split("/")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Transformation comparison box */}
        <div className="mt-5 space-y-3">
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-rose-700">
              <span>Было (слабое пассивное описание):</span>
              <span className="text-rose-700">Отклоняется HR</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-700 line-through opacity-80">«{activeExample.weak}»</p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                Стало (оцифровано по STAR):
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activeExample.strong)}
                className="flex items-center gap-1 py-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Скопировать</span>
                  </>
                )}
              </button>
            </div>
            <p
              className={cn(
                "mt-2 text-xs font-medium leading-relaxed text-slate-800 transition-opacity duration-300 sm:text-sm",
                isImproving ? "opacity-30" : "opacity-100",
              )}
            >
              «{activeExample.strong}»
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            +68% к вероятности приглашения на интервью
          </span>
          <a
            href="/ai-yurist"
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Подробнее в AI-Юристе
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
