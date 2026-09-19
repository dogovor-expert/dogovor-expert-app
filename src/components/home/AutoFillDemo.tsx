"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";

/**
 * Мини-демо «30 секунд»: поля печатаются сами, галочки появляются,
 * печать ставится, всплывает «Файл готов». Циклично, без библиотек.
 */

const FIELDS: { label: string; value: string; ok?: boolean }[] = [
  { label: "Заимодавец", value: "Иванов И. И." },
  { label: "Заёмщик", value: "Петров П. П." },
  { label: "Сумма", value: "150 000 ₽" },
  { label: "Проценты", value: "без процентов ✓", ok: true },
];

const CHECKS = ["Паспортные данные", "Сумма прописью", "Дата возврата"];

export default function AutoFillDemo() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const fields = Array.from(el.querySelectorAll<HTMLElement>(".demo-field"));
    const checks = Array.from(el.querySelectorAll<HTMLElement>(".demo-check"));
    const stamp = el.querySelector<HTMLElement>(".demo-stamp");
    const toast = el.querySelector<HTMLElement>(".demo-toast");
    const steps = Array.from(el.querySelectorAll<HTMLElement>(".demo-step"));
    const lines = Array.from(el.querySelectorAll<HTMLElement>(".demo-line > i"));

    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function type(node: HTMLElement, text: string) {
      node.textContent = "";
      const caret = document.createElement("span");
      caret.className = "demo-caret";
      for (let i = 0; i < text.length; i++) {
        if (cancelled) return;
        node.textContent = text.slice(0, i + 1);
        node.appendChild(caret);
        await sleep(36 + Math.random() * 36);
      }
      caret.remove();
    }

    async function reset() {
      fields.forEach((f) => {
        f.classList.remove("filled");
        const v = f.querySelector<HTMLElement>(".demo-val");
        if (v) {
          v.textContent = "";
          v.classList.remove("text-emerald-600");
        }
      });
      checks.forEach((c) => c.classList.remove("on"));
      stamp?.classList.remove("show");
      toast?.classList.remove("show");
      steps.forEach((s) => s.classList.remove("active", "done"));
      lines.forEach((l) => (l.style.width = "0"));
      steps[0]?.classList.add("active");
      await sleep(700);
    }

    async function run() {
      while (!cancelled) {
        await reset();
        await sleep(250);
        steps[0]?.classList.add("done");
        steps[1]?.classList.add("active");
        if (lines[0]) lines[0].style.width = "100%";
        await sleep(400);

        for (const f of fields) {
          f.classList.add("filled");
          const v = f.querySelector<HTMLElement>(".demo-val");
          if (v) {
            await type(v, v.dataset.t ?? "");
            if (v.dataset.ok) v.classList.add("text-emerald-600");
          }
          await sleep(140);
        }
        for (const c of checks) {
          c.classList.add("on");
          await sleep(170);
        }
        stamp?.classList.add("show");
        await sleep(420);
        steps[1]?.classList.add("done");
        steps[2]?.classList.add("active");
        if (lines[1]) lines[1].style.width = "100%";
        toast?.classList.add("show");
        await sleep(3600);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div ref={root} className="relative mx-auto w-full max-w-[400px]">
      {/* степпер */}
      <div className="mb-3 flex items-center gap-2 pl-0.5">
        {["Шаблон", "Заполнение", "Готово"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="demo-step flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
              <span className="grid h-5 w-5 place-items-center rounded-full border-[1.5px] border-gray-200 bg-white text-[10px]">
                {i + 1}
              </span>
              {s}
            </div>
            {i < 2 && (
              <span className="demo-line h-0.5 w-5 overflow-hidden rounded-full bg-gray-200">
                <i className="block h-full w-0 bg-emerald-500 transition-all duration-500" />
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-elevated">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="grid h-8 w-8 flex-none place-items-center rounded-[10px] bg-gradient-to-br from-brand-500 to-purple-600 text-sm font-extrabold text-white">
            D
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
              Договор № 101
            </div>
            <div className="truncate text-sm font-extrabold text-gray-900">Расписка</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {FIELDS.map((f) => (
            <div
              key={f.label}
              className="demo-field flex items-center justify-between gap-3 rounded-[10px] border border-gray-200 bg-[#fbfdff] px-3 py-2"
            >
              <span className="text-[10.5px] font-semibold text-gray-500">{f.label}</span>
              <span className="demo-val text-xs font-bold text-gray-900" data-t={f.value} data-ok={f.ok ? "1" : undefined} />
            </div>
          ))}
        </div>

        <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHECKS.map((c) => (
            <div key={c} className="demo-check flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
              <i className="grid h-4 w-4 flex-none place-items-center rounded-full bg-gray-100 text-[9px] font-black not-italic text-transparent transition-colors">
                <Check className="h-2.5 w-2.5" />
              </i>
              {c}
            </div>
          ))}
        </div>

        <div className="demo-stamp absolute bottom-3.5 right-4 grid h-16 w-16 scale-150 rotate-[14deg] place-items-center rounded-full border-2 border-emerald-500 bg-emerald-50/50 text-center text-[8px] font-black uppercase leading-tight tracking-wide text-emerald-600 opacity-0 transition-all duration-500">
          готово
          <br />к печати
        </div>
      </div>

      <div className="demo-toast absolute -bottom-4 left-1/2 inline-flex -translate-x-1/2 translate-y-2.5 items-center gap-2 rounded-xl bg-dark-900 px-4 py-2.5 text-xs font-bold text-white opacity-0 shadow-[0_12px_30px_rgba(15,23,42,0.28)] transition-all duration-500">
        <Check className="h-3.5 w-3.5 text-emerald-400" />
        Файл готов · PDF и DOCX
      </div>
    </div>
  );
}
