"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { currentProPrice, PROMO_LABEL, isPromoActive, promoCountdownTarget, formatRub } from "@/lib/pricing";
import CountdownTimer from "@/components/billing/CountdownTimer";

export default function PromoPill() {
  const [active, setActive] = useState<boolean | null>(null);
  const promo = isPromoActive();

  useEffect(() => {
    if (!promo) return;
    fetch("/api/subscription-status")
      .then((r) => (r.ok ? (r.json() as Promise<{ subscription_active?: boolean }>) : null))
      .then((s) => setActive(!!s?.subscription_active))
      .catch(() => setActive(false));
  }, [promo]);

  if (!promo || active === null || active) return null;

  return (
    <Link
      href="/billing"
      className="hidden md:inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-brand-50 border border-amber-200 hover:border-amber-300 transition-colors group shrink-0"
      title="Акция на подписку PRO"
    >
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-400 text-amber-950 text-[10px] font-bold">
        <Flame className="w-3 h-3" />
        {PROMO_LABEL}
      </span>
      <span className="text-xs font-semibold text-gray-800">
        PRO {formatRub(currentProPrice())}
      </span>
      {/* Раньше здесь была зачёркнутая «старая цена» 990 ₽, которой никогда
          не существовало. Показываем только реальную цену и оставшееся время. */}
      <span className="text-[10px] text-gray-600 tabular-nums group-hover:text-brand-600 transition-colors">
        <CountdownTimer endsAt={promoCountdownTarget()} compact />
      </span>
    </Link>
  );
}