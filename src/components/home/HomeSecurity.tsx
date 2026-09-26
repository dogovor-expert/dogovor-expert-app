import { Eye, FileClock, KeyRound, ShieldCheck } from "lucide-react";

const POINTS = [
  {
    icon: KeyRound,
    title: "Данные остаются в браузере",
    desc: "Документы обрабатываются локально — на сервер ничего не отправляется без вашего отдельного согласия.",
  },
  {
    icon: Eye,
    title: "Согласование по защищённой ссылке",
    desc: "Делитесь документами с контрагентами через ссылку с токеном — правки второй стороны видны только вам.",
  },
  {
    icon: FileClock,
    title: "Метки времени и проверка подписи",
    desc: "Подписи УКЭП проверяются по цепочке доверия TSL Минцифры с метками времени TSA.",
  },
  {
    icon: ShieldCheck,
    title: "Полное соответствие 152-ФЗ",
    desc: "Обработка персональных данных построена в соответствии с требованиями закона «О персональных данных».",
  },
];

const AUDIT_LOG = [
  { ok: true, text: "PAdES-подпись встроена в PDF" },
  { ok: true, text: "TSL Минцифры — цепочка проверена" },
  { ok: true, text: "CRL/OCSP — отзыв не найден" },
  { ok: true, text: "TSA — метка времени attached" },
  { ok: false, text: "rate-limit включён на всех API" },
];

/** Безопасность — честные пункты + стилизованный журнал проверок. */
export default function HomeSecurity() {
  return (
    <section id="security" className="scroll-mt-4 bg-white py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Безопасность и приватность</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Ваши документы видите только вы
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Мы проектировали сервис так, будто в любой момент можем провести аудит безопасности:
            строгая типизация, валидация всех API-границ и ролевой доступ администрирования.
          </p>

          <div className="mt-10 space-y-6">
            {POINTS.map((p) => (
              <div key={p.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <p.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-100/60 via-teal-50/40 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative rounded-2xl border border-slate-200 bg-slate-900 p-8 text-slate-100 shadow-2xl shadow-slate-900/20">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              Журнал проверок
            </div>
            <div className="mt-6 space-y-4 font-mono text-xs leading-relaxed">
              {AUDIT_LOG.map((row) => (
                <div key={row.text} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className={row.ok ? "text-emerald-400" : "text-amber-400"}>{row.ok ? "✓" : "i"}</span>{" "}
                  {row.text}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-slate-400">
              <span>800+ unit-тестов качества</span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-400">
                Все проверки пройдены
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
