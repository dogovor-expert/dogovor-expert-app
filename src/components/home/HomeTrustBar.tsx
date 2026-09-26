import { FileLock2, Landmark, ShieldCheck, Signature, Timer } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, label: "152-ФЗ" },
  { icon: Signature, label: "УКЭП · КриптоПро" },
  { icon: Landmark, label: "TSL Минцифры" },
  { icon: FileLock2, label: "Данные в браузере" },
  { icon: Timer, label: "Метки времени TSA" },
];

/** Полоса доверия под hero — технологии и стандарты. */
export default function HomeTrustBar() {
  return (
    <section aria-label="Технологии и стандарты" className="border-y border-slate-100 bg-slate-50/70 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          Технологии и стандарты, на которые вы можете положиться
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-slate-500">
              <Icon className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
