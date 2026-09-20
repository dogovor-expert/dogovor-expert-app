"use client";

import { useCookieConsent } from "@/hooks/useCookieConsent";

export type AdSlotId =
  | "HOME_INFEED"
  | "BLOG_INFEED"
  | "BLOG_SIDEBAR"
  | "ARTICLE_INLINE"
  | "ARTICLE_SIDEBAR"
  | "ARTICLE_FOOTER"
  | "TEMPLATES_INFEED"
  | "CALC_RESULT"
  | "LANDING_INFEED";

const SLOT_MIN_HEIGHT: Record<AdSlotId, number> = {
  HOME_INFEED: 250,
  BLOG_INFEED: 280,
  BLOG_SIDEBAR: 250,
  ARTICLE_INLINE: 250,
  ARTICLE_SIDEBAR: 250,
  ARTICLE_FOOTER: 200,
  TEMPLATES_INFEED: 200,
  CALC_RESULT: 200,
  LANDING_INFEED: 250,
};

// РСЯ: слот виден только при отдельном согласии на marketing (152-ФЗ, не путать с analytics).
const ADS_ENABLED = (process.env.NEXT_PUBLIC_ADS_ENABLED ?? "0") === "1";

export function AdSlot({ id, className }: { id: AdSlotId; className?: string }) {
  const { isReady, categories } = useCookieConsent();
  const visible = ADS_ENABLED && isReady && categories.marketing;
  if (!visible) return null;
  return (
    <div
      aria-label="Реклама"
      className={className}
      style={{ minHeight: SLOT_MIN_HEIGHT[id] }}
    />
  );
}