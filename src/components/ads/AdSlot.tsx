"use client";

import { useEffect, useId, useRef } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import {
  ensureRtbLoader,
  renderRtbBlock,
  rtbBlockId,
  SLOT_MIN_HEIGHT,
  type AdSlotId,
} from "@/lib/ads";

export type { AdSlotId } from "@/lib/ads";

// РСЯ: слот виден только при отдельном согласии на marketing (152-ФЗ, не путать с analytics).
const ADS_ENABLED = (process.env.NEXT_PUBLIC_ADS_ENABLED ?? "0") === "1";

export function AdSlot({ id, className }: { id: AdSlotId; className?: string }) {
  const { isReady, categories } = useCookieConsent();
  const visible = ADS_ENABLED && isReady && categories.marketing;
  const blockId = rtbBlockId(id);
  const reactId = useId();
  const containerId = `yandex_rtb_${id}_${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !blockId || !ref.current) return;
    ensureRtbLoader();
    renderRtbBlock(containerId, blockId);
  }, [visible, blockId, containerId]);

  if (!visible) return null;

  return (
    <div
      id={containerId}
      ref={ref}
      aria-label="Реклама"
      className={className}
      style={{ minHeight: SLOT_MIN_HEIGHT[id] }}
    />
  );
}