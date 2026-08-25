"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { YANDEX_METRIKA_ID } from "@/lib/site";

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

const ENABLED = YANDEX_METRIKA_ID && YANDEX_METRIKA_ID !== "XXXXXXXX";

export function YandexMetrikaPageView() {
  return (
    <Suspense fallback={null}>
      <YandexMetrikaPageViewInner />
    </Suspense>
  );
}

function YandexMetrikaPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    try {
      setConsent(localStorage.getItem("dogovor_cookie_consent"));
    } catch {
      setConsent(null);
    }
  }, []);

  useEffect(() => {
    if (!ENABLED || consent !== "accepted" || typeof window === "undefined" || typeof window.ym !== "function") return;
    window.ym(Number(YANDEX_METRIKA_ID), "hit", window.location.pathname + window.location.search);
  }, [pathname, searchParams, consent]);

  return null;
}