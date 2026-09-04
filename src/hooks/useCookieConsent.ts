"use client";
/**
 * Централизованное управление согласием на cookies.
 *
 * Архитектурные проблемы, которые это решает:
 *  1. Каждый компонент (AppLayout, YandexMetrika) раньше читал localStorage сам —
 *     не было broadcast-механизма, метрика никогда не подгружалась после accept.
 *  2. `useState(null)` на SSR + `useEffect` после гидратации → FOUC (баннер
 *     на мгновение появляется и исчезает).
 *  3. При навигации между страницами AppLayout пересоздаёт подписки и
 *     race-condition с useEffect pathname → баннер моргает.
 *
 * Решение:
 *  - Lazy init из localStorage через `useSyncExternalStore` — синхронно,
 *    без мерцания, совместимо с SSR (на сервере всегда null, на клиенте —
 *    сразу значение из localStorage до первого рендера).
 *  - Custom event `dogovor:cookie-consent` для broadcast: YandexMetrika и
 *    любые другие потребители подписываются и реагируют на изменение.
 *  - `storage` event для синхронизации между вкладками.
 */
import { useCallback, useSyncExternalStore } from "react";

export const COOKIE_CONSENT_KEY = "dogovor_cookie_consent";
export const COOKIE_CONSENT_EVENT = "dogovor:cookie-consent";

export type CookieConsent = "accepted" | "declined";

function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (v === "accepted" || v === "declined") return v;
    return null;
  } catch {
    // localStorage может бросить SecurityError в private mode / iframe sandbox.
    return null;
  }
}

function writeCookieConsent(value: CookieConsent): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    return true;
  } catch {
    return false;
  }
}

// Единый store: emit событие при изменении, чтобы все подписчики
// (useSyncExternalStore + window listeners) получили новое значение.
function emit(value: CookieConsent | null): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
}

// Текущее значение в модульной области — одинаково для всех подписчиков.
let currentValue: CookieConsent | null = null;
if (typeof window !== "undefined") {
  currentValue = readCookieConsent();
}

function subscribe(notify: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onLocal = () => {
    currentValue = readCookieConsent();
    notify();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === COOKIE_CONSENT_KEY) {
      currentValue = readCookieConsent();
      notify();
    }
  };
  window.addEventListener(COOKIE_CONSENT_EVENT, onLocal);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, onLocal);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): CookieConsent | null {
  return currentValue;
}

// Сервер всегда возвращает null — клиент перезапишет после гидратации.
// useSyncExternalStore требует стабильного возврата на сервере.
function getServerSnapshot(): CookieConsent | null {
  return null;
}

export function useCookieConsent(): {
  consent: CookieConsent | null;
  isReady: boolean;
  accept: () => void;
  decline: () => void;
  reset: () => void;
} {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const accept = useCallback(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { __acceptCalled?: number }).__acceptCalled =
        ((window as unknown as { __acceptCalled?: number }).__acceptCalled || 0) + 1;
    }
    if (writeCookieConsent("accepted")) {
      currentValue = "accepted";
      emit("accepted");
    }
  }, []);

  const decline = useCallback(() => {
    if (writeCookieConsent("declined")) {
      currentValue = "declined";
      emit("declined");
    }
  }, []);

  const reset = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(COOKIE_CONSENT_KEY);
      currentValue = null;
      emit(null);
    } catch {
      /* noop */
    }
  }, []);

  return { consent, isReady: consent !== null, accept, decline, reset };
}

/**
 * Подписка на изменение cookie consent из любого компонента без React-хука.
 * Полезно для инициализации сторонних скриптов (YandexMetrika, GA и т.д.),
 * которым нужно стартовать ПОСЛЕ accept, а не во время mount.
 */
export function onCookieConsentChange(handler: (consent: CookieConsent | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const ce = e as CustomEvent<CookieConsent | null>;
    handler(ce.detail);
  };
  window.addEventListener(COOKIE_CONSENT_EVENT, listener);
  return () => window.removeEventListener(COOKIE_CONSENT_EVENT, listener);
}
