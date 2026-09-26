import Link from "next/link";
import { ShieldCheck } from "lucide-react";

/** Финальный CTA — тёмная полоса. */
export default function HomeCta() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-72 w-[50rem] -translate-x-1/2 rounded-full bg-indigo-600/25 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-indigo-300">
          <ShieldCheck className="h-4 w-4" />
          Без карты · без установки программ
        </span>
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Составьте свой первый документ прямо сейчас
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
          Файл будет готов через пару минут — бесплатно, без регистрации, данные не покидают браузер.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/builder"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-slate-900 shadow-xl transition hover:bg-slate-100"
          >
            Составить документ бесплатно
          </Link>
          <Link
            href="/billing"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/5"
          >
            Смотреть тарифы
          </Link>
        </div>
      </div>
    </section>
  );
}
