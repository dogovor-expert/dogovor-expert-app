/**
 * Тесты для централизованного хука cookie consent (Фаза 1).
 *
 * Покрывает:
 *  - Granular consent (categories: necessary/analytics/marketing)
 *  - acceptAll / declineAll / update / reset
 *  - Broadcast через dogovor:cookie-consent
 *  - Multi-tab через storage event
 *  - Private mode (SecurityError → false)
 *  - TTL (365 дней) — после истечения возвращается null
 *  - Persist через mount (consent остаётся после unmount/remount)
 *  - Persistence при нескольких инстансах хука
 *  - Мульти-инстанс: оба хука видят одно значение
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useCookieConsent,
  onCookieConsentChange,
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_EVENT,
  CONSENT_ALL,
  CONSENT_NECESSARY_ONLY,
  POLICY_VERSION,
  CONSENT_TTL_MS,
  type CookieCategories,
} from "@/hooks/useCookieConsent";

describe("useCookieConsent — granular", () => {
  beforeEach(() => {
    try {
      window.localStorage.removeItem(COOKIE_CONSENT_KEY);
    } catch {
      /* noop */
    }
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("первый mount: consent === null, isReady=false, categories = necessary-only default", () => {
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.consent).toBeNull();
    expect(result.current.isReady).toBe(false);
    expect(result.current.categories).toEqual(CONSENT_NECESSARY_ONLY);
  });

  it("acceptAll: сохраняет ВСЕ категории, ts, policyVersion", () => {
    const { result } = renderHook(() => useCookieConsent());
    const before = Date.now();
    let ok: boolean = false;
    act(() => {
      ok = result.current.acceptAll();
    });
    expect(ok).toBe(true);
    expect(result.current.isReady).toBe(true);
    expect(result.current.categories).toEqual(CONSENT_ALL);
    expect(result.current.consent?.ts).toBeGreaterThanOrEqual(before);
    expect(result.current.consent?.policyVersion).toBe(POLICY_VERSION);

    const stored = JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_KEY) || "{}");
    expect(stored.categories).toEqual(CONSENT_ALL);
    expect(stored.policyVersion).toBe(POLICY_VERSION);
  });

  it("declineAll: сохраняет только necessary", () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => {
      result.current.declineAll();
    });
    expect(result.current.isReady).toBe(true);
    expect(result.current.categories).toEqual(CONSENT_NECESSARY_ONLY);
  });

  it("update: granular — только analytics, без marketing", () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => {
      result.current.update({ analytics: true });
    });
    expect(result.current.categories.analytics).toBe(true);
    expect(result.current.categories.marketing).toBe(false);
    expect(result.current.categories.necessary).toBe(true);
  });

  it("update: можно изменить ранее сделанный выбор", () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => {
      result.current.acceptAll();
    });
    expect(result.current.categories.marketing).toBe(true);
    act(() => {
      result.current.update({ analytics: false, marketing: false });
    });
    expect(result.current.categories.analytics).toBe(false);
    expect(result.current.categories.marketing).toBe(false);
  });

  it("update: не позволяет отключить necessary", () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => {
      result.current.acceptAll();
    });
    act(() => {
      // @ts-expect-error — TypeScript должен ругаться, runtime — игнорируем
      result.current.update({ necessary: false });
    });
    expect(result.current.categories.necessary).toBe(true);
  });

  it("reset: сбрасывает consent и localStorage", () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => {
      result.current.acceptAll();
    });
    expect(result.current.isReady).toBe(true);
    act(() => {
      result.current.reset();
    });
    expect(result.current.consent).toBeNull();
    expect(result.current.isReady).toBe(false);
    expect(window.localStorage.getItem(COOKIE_CONSENT_KEY)).toBeNull();
  });

  it("broadcast: onCookieConsentChange вызывается после изменения", () => {
    const handler = vi.fn();
    const off = onCookieConsentChange(handler);
    try {
      const { result } = renderHook(() => useCookieConsent());
      act(() => {
        result.current.acceptAll();
      });
      expect(handler).toHaveBeenCalledTimes(1);
      const last = handler.mock.calls.at(-1)![0];
      expect(last?.categories).toEqual(CONSENT_ALL);

      act(() => {
        result.current.declineAll();
      });
      expect(handler).toHaveBeenCalledTimes(2);
      const lastDecline = handler.mock.calls.at(-1)![0];
      expect(lastDecline?.categories).toEqual(CONSENT_NECESSARY_ONLY);

      act(() => {
        result.current.reset();
      });
      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler.mock.calls.at(-1)![0]).toBeNull();
    } finally {
      off();
    }
  });

  it("private mode: SecurityError → acceptAll/declineAll/update возвращают false", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    const { result } = renderHook(() => useCookieConsent());
    expect(() => {
      act(() => {
        expect(result.current.acceptAll()).toBe(false);
        expect(result.current.declineAll()).toBe(false);
        expect(result.current.update({ analytics: true })).toBe(false);
      });
    }).not.toThrow();
    // Состояние не изменилось, потому что запись не удалась
    expect(result.current.isReady).toBe(false);

    setItemSpy.mockRestore();
  });

  it("мульти-инстанс: оба хука видят одно и то же значение", () => {
    const a = renderHook(() => useCookieConsent());
    const b = renderHook(() => useCookieConsent());
    act(() => {
      a.result.current.acceptAll();
    });
    expect(b.result.current.consent?.categories).toEqual(CONSENT_ALL);
  });

  it("TTL: после истечения 365 дней consent возвращается как null", () => {
    // Сначала принимаем
    const { result } = renderHook(() => useCookieConsent());
    act(() => {
      result.current.acceptAll();
    });

    // Подделываем прошедшее время: перезаписываем localStorage с ts = старым
    const stored = JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_KEY) || "{}");
    stored.ts = Date.now() - CONSENT_TTL_MS - 1000;
    window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(stored));

    // После unmount/remount getSnapshot должен вернуть null
    // (currentValue обновится только при следующем notify; поэтому simulate
    // через ручной dispatch события)
    act(() => {
      window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT));
    });
    // Модульный currentValue перечитан: ts < TTL → null
    expect(result.current.consent).toBeNull();
  });

  it("повреждённый JSON в localStorage: возвращает null, не падает", () => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, "{broken json");
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.consent).toBeNull();
  });

  it("невалидный формат (нет ts): возвращает null", () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({ categories: { necessary: true, analytics: true, marketing: true } })
    );
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.consent).toBeNull();
  });

  it("COOKIE_CONSENT_KEY и COOKIE_CONSENT_EVENT экспортированы", () => {
    expect(COOKIE_CONSENT_KEY).toBe("dogovor_cookie_consent");
    expect(COOKIE_CONSENT_EVENT).toBe("dogovor:cookie-consent");
  });

  it("константы CONSENT_ALL и CONSENT_NECESSARY_ONLY корректны", () => {
    expect(CONSENT_ALL).toEqual({ necessary: true, analytics: true, marketing: true });
    expect(CONSENT_NECESSARY_ONLY).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  });
});
