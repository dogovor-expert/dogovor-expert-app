"use client";
/**
 * Централизованное управление согласием на cookies.
 *
 * Архитектура (Фаза 1 аудита, 2026):
 *  - Granular consent по категориям (GDPR Art. 7(2) — specific consent)
 *    - necessary: всегда true, не требует согласия (strictly necessary для работы сервиса)
 *    - analytics: Яндекс.Метрика, веб-аналитика
 *    - marketing: реклама, ремаркетинг (сейчас не используется, зарезервировано)
 *  - Lazy init через useSyncExternalStore — синхронное чтение localStorage
 *    до первого рендера, без FOUC, без hydration mismatch.
 *  - Broadcast CustomEvent 'dogovor:cookie-consent' для всех потребителей
 *    (YandexMetrika, будущий GA, Sentry-gate).
 *  - storage event для синхронизации между вкладками.
 *  - Версия политики + timestamp — для re-consent (CNIL рекомендует 12 мес).
 *  - Возврат boolean из accept/decline/update — для обработки private mode
 *    (Safari SecurityError → false → показать fallback-сообщение).
 */
import { useCallback, useSyncExternalStore } from "react";

export const COOKIE_CONSENT_KEY = "dogovor_cookie_consent";
export const COOKIE_CONSENT_EVENT = "dogovor:cookie-consent";
/** Версия политики конфиденциальности. Менять при существенных изменениях /privacy. */
export const POLICY_VERSION = "2026-09-05";
/** Срок действия согласия — 365 дней (CNIL рекомендация). После — баннер снова. */
export const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

/** Категории cookies по GDPR Art. 7(2) / ePrivacy. */
export interface CookieCategories {
  necessary: true; // всегда true, нельзя отключить
  analytics: boolean; // Яндекс.Метрика
  marketing: boolean; // реклама, ретаргетинг (зарезервировано)
}

export interface StoredConsent {
  categories: CookieCategories;
  ts: number; // timestamp принятия
  policyVersion: string; // версия /privacy на момент согласия
}

/** Все категории включены (для удобства в UI). */
export const CONSENT_ALL: CookieCategories = {
  necessary: true,
  analytics: true,
  marketing: true,
};
/** Только strictly necessary. */
export const CONSENT_NECESSARY_ONLY: CookieCategories = {
  necessary: true,
  analytics: false,
  marketing: false,
};

/** Что возвращает стор: либо null (ещё не выбрано), либо полный объект. */
export type CookieConsentValue = StoredConsent | null;

function isStoredConsent(v: unknown): v is StoredConsent {
  if (typeof v !== "object" || v === null) return false;
  const c = (v as Record<string, unknown>).categories;
  if (typeof c !== "object" || c === null) return false;
  const cat = c as Record<string, unknown>;
  return (
    cat.necessary === true &&
    typeof cat.analytics === "boolean" &&
    typeof cat.marketing === "boolean" &&
    typeof (v as { ts?: unknown }).ts === "number" &&
    typeof (v as { policyVersion?: unknown }).policyVersion === "string"
  );
}

function readCookieConsent(): CookieConsentValue {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredConsent(parsed)) return null;
    // Проверяем TTL: если истёк — возвращаем null (покажем баннер заново).
    if (Date.now() - parsed.ts > CONSENT_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCookieConsent(value: StoredConsent): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function clearCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.removeItem(COOKIE_CONSENT_KEY);
    return true;
  } catch {
    return false;
  }
}

function emit(value: CookieConsentValue): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
}

let currentValue: CookieConsentValue = null;
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

function getSnapshot(): CookieConsentValue {
  return currentValue;
}

function getServerSnapshot(): CookieConsentValue {
  return null;
}

export interface UseCookieConsentReturn {
  /** Полный объект consent или null, если юзер ещё не сделал выбор. */
  consent: CookieConsentValue;
  /** Короткий флаг — consent не null (безопасно показывать YandexMetrika и т.п.). */
  isReady: boolean;
  /** Категории (если isReady) — для проверки analytics/marketing. */
  categories: CookieCategories;
  /** Принять всё (необходимые всегда true; analytics + marketing = true). */
  acceptAll: () => boolean;
  /** Отклонить всё кроме необходимых. */
  declineAll: () => boolean;
  /** Granular update: {analytics, marketing}. */
  update: (categories: Partial<CookieCategories>) => boolean;
  /** Сбросить — баннер покажется снова. */
  reset: () => boolean;
}

export function useCookieConsent(): UseCookieConsentReturn {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const buildAndStore = useCallback((categories: CookieCategories): boolean => {
    const stored: StoredConsent = {
      categories,
      ts: Date.now(),
      policyVersion: POLICY_VERSION,
    };
    if (!writeCookieConsent(stored)) return false;
    currentValue = stored;
    emit(stored);
    return true;
  }, []);

  const acceptAll = useCallback(() => buildAndStore(CONSENT_ALL), [buildAndStore]);
  const declineAll = useCallback(() => buildAndStore(CONSENT_NECESSARY_ONLY), [buildAndStore]);
  const update = useCallback(
    (partial: Partial<CookieCategories>) => {
      const next: CookieCategories = {
        necessary: true, // нельзя отключить
        analytics: partial.analytics ?? consent?.categories.analytics ?? false,
        marketing: partial.marketing ?? consent?.categories.marketing ?? false,
      };
      return buildAndStore(next);
    },
    [buildAndStore, consent]
  );
  const reset = useCallback((): boolean => {
    if (!clearCookieConsent()) return false;
    currentValue = null;
    emit(null);
    return true;
  }, []);

  const categories: CookieCategories = consent?.categories ?? CONSENT_NECESSARY_ONLY;
  return {
    consent,
    isReady: consent !== null,
    categories,
    acceptAll,
    declineAll,
    update,
    reset,
  };
}

/**
 * Подписка на изменение consent из любого места (включая не-React код).
 * Возвращает unsubscribe-функцию.
 */
export function onCookieConsentChange(
  handler: (consent: CookieConsentValue) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const ce = e as CustomEvent<CookieConsentValue>;
    handler(ce.detail);
  };
  window.addEventListener(COOKIE_CONSENT_EVENT, listener);
  return () => window.removeEventListener(COOKIE_CONSENT_EVENT, listener);
}
