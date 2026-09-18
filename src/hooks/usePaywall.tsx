"use client";

import { useCallback, useEffect, useState } from "react";
import PaywallModal from "@/components/builder/PaywallModal";

/**
 * Подписка на PRO и контроль платного шлюза.
 * Используется там, где нужно ограничить функцию тарифом PRO:
 * экспорт пакета, согласование, облачные диски, УКЭП.
 */
export function usePaywall() {
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTitle, setPaywallTitle] = useState<string | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    fetch("/api/subscription-status")
      .then((r) => r.json() as Promise<{ subscription_active?: boolean }>)
      .then((j) => {
        if (alive) setSubscriptionActive(!!j?.subscription_active);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const openPaywall = useCallback((title?: string) => {
    setPaywallTitle(title);
    setPaywallOpen(true);
  }, []);

  /** Возвращает true, если действие разрешено (PRO), иначе открывает шлюз и возвращает false. */
  const guard = useCallback((): boolean => {
    if (subscriptionActive) return true;
    setPaywallOpen(true);
    return false;
  }, [subscriptionActive]);

  const modal = (
    <PaywallModal
      isOpen={paywallOpen}
      onClose={() => setPaywallOpen(false)}
      title={paywallTitle}
    />
  );

  return { subscriptionActive, guard, openPaywall, modal };
}
