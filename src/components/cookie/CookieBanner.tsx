"use client";
/**
 * Cookies-баннер и панель настроек (Фаза 1 аудита, 2026).
 *
 * Архитектура:
 *  - Granular consent (GDPR Art. 7(2)): 2 кнопки одинакового веса
 *    «Принять всё» / «Только необходимые» + третья «Настроить»
 *  - Persistent UI: иконка 🍪 переехала В ХЕДЕР рядом с колокольчиком
 *    (раньше была fixed bottom-right и перекрывала SupportLauncher).
 *    Рендерится снаружи через AppLayout; этот компонент показывает
 *    баннер-приветствие и управляет settings-диалогом по внешнему флагу.
 *  - A11y:
 *    - role="dialog" + aria-modal + aria-labelledby + aria-describedby
 *    - Escape → decline / закрыть
 *    - autoFocus на «Принять всё» (при первом визите)
 *    - aria-live="polite" для screen-reader announcement
 *  - Приватный режим: если запись не удалась — inline-предупреждение
 *  - SSR-safe: на сервере consent всегда null → рендерим null (баннер появится
 *    после гидратации, без мерцания — useSyncExternalStore даёт реальное
 *    значение синхронно).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Cookie, Settings, X, Check } from "lucide-react";
import Link from "next/link";
import { useCookieConsent, type CookieCategories } from "@/hooks/useCookieConsent";

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface CookieBannerProps {
  /** Внешний флаг: показать панель настроек. Используется иконкой в хедере. */
  settingsOpenExternal?: boolean;
  /** Уведомить о закрытии панели, чтобы очистить внешний флаг. */
  onSettingsClosed?: () => void;
}

export function CookieBanner({ settingsOpenExternal, onSettingsClosed }: CookieBannerProps = {}) {
  const {
    consent,
    isReady,
    acceptAll,
    declineAll,
    update,
  } = useCookieConsent();
  const [mounted, setMounted] = useState(false);
  const [settingsOpenInternal, setSettingsOpenInternal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draft, setDraft] = useState<CookieCategories>({
    necessary: true,
    analytics: true,
    marketing: false,
  });
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Внешний флаг имеет приоритет — иконка в хедере открывает панель
  const settingsOpen = settingsOpenExternal === true || settingsOpenInternal;
  const closeSettings = useCallback(() => {
    setSettingsOpenInternal(false);
    onSettingsClosed?.();
  }, [onSettingsClosed]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // При открытии панели настроек — pre-fill из текущего consent
  useEffect(() => {
    if (settingsOpen && consent) {
      setDraft(consent.categories);
    } else if (settingsOpen && !consent) {
      // первый визит — дефолт «только необходимые»
      setDraft({ necessary: true, analytics: false, marketing: false });
    }
  }, [settingsOpen, consent]);

  // Escape: закрывает панель настроек или вызывает decline (при первом визите)
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (settingsOpen) {
        closeSettings();
        setSaveError(null);
        return;
      }
      if (consent === null && !isReady) {
        // первый визит — Escape = «только необходимые»
        declineAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, settingsOpen, consent, isReady, declineAll, closeSettings]);

  // autoFocus на «Принять всё» при первом визите (только если consent не выбран)
  useEffect(() => {
    if (!mounted) return;
    if (consent === null && !settingsOpen) {
      // Небольшая задержка, чтобы браузер успел отрисовать dialog
      const t = setTimeout(() => acceptBtnRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [mounted, consent, settingsOpen]);

  // Focus-trap внутри панели настроек
  useEffect(() => {
    if (!settingsOpen || !dialogRef.current) return;
    const root = dialogRef.current;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    root.addEventListener("keydown", handler);
    return () => root.removeEventListener("keydown", handler);
  }, [settingsOpen]);

  if (!mounted) return null;

  // === Настройки (panel) ===
  if (settingsOpen) {
    const toggle = (key: "analytics" | "marketing") => (v: boolean) => {
      setDraft((d) => ({ ...d, [key]: v }));
    };
    const save = () => {
      setSaveError(null);
      const ok = update(draft);
      if (!ok) {
        setSaveError(
          "Не удалось сохранить выбор. Включите cookies в настройках браузера."
        );
        return;
      }
      closeSettings();
    };
    return (
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-settings-title"
        aria-describedby="cookie-settings-desc"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 motion-reduce:bg-black/60 p-4"
      >
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-brand-500" aria-hidden />
              <h2
                id="cookie-settings-title"
                className="text-base font-bold text-gray-900"
              >
                Настройки cookies
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                closeSettings();
                setSaveError(null);
              }}
              className="p-1.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg motion-reduce:transition-none"
              aria-label="Закрыть настройки cookies"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <p
            id="cookie-settings-desc"
            className="text-sm text-gray-600 leading-relaxed mb-4"
          >
            Выберите, какие cookies разрешить.{" "}
            <Link
              href="/privacy"
              className="text-brand-600 hover:underline"
            >
              Подробнее в Политике конфиденциальности
            </Link>
            .
          </p>
          <div className="space-y-3">
            <CategoryRow
              title="Необходимые"
              desc="Сессия, авторизация, корзина. Нужны для работы сервиса."
              checked
              disabled
              onChange={() => {}}
            />
            <CategoryRow
              title="Аналитика"
              desc="Яндекс.Метрика и запись визитов (по согласию). Собственная обезличенная аналитика сервиса."
              checked={draft.analytics}
              onChange={toggle("analytics")}
            />
            <CategoryRow
              title="Маркетинг"
              desc="Ремаркетинг и реклама (сейчас не используется)."
              checked={draft.marketing}
              onChange={toggle("marketing")}
            />
          </div>
          {saveError && (
            <p
              role="alert"
              className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2"
            >
              {saveError}
            </p>
          )}
          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={save}
              className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-medium text-sm rounded-lg transition-colors motion-reduce:transition-none"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => {
                closeSettings();
                setSaveError(null);
              }}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors motion-reduce:transition-none"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === Persistent icon переехал в AppLayout (хедер, рядом с колокольчиком) ===
  // Возвращаем null, когда consent уже выбран — иначе фикс-иконка перекрывает SupportLauncher.
  if (consent !== null && isReady) {
    return null;
  }

  // === First-visit banner ===
  return (
    <div
      role="region"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      aria-live="polite"
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-xl bg-white border border-gray-200 rounded-2xl shadow-xl p-4 pb-safe"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0"
          aria-hidden
        >
          <Cookie className="w-4.5 h-4.5 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            id="cookie-banner-title"
            className="text-sm font-semibold text-gray-900"
          >
            Мы используем cookies
          </p>
          <p
            id="cookie-banner-desc"
            className="text-xs text-gray-600 mt-0.5 leading-relaxed"
          >
            Аналитика: Яндекс.Метрика и запись визитов — по согласию,
            собственная обезличенная статистика сервиса. Без маркетинга.{" "}
            <Link
              href="/privacy"
              className="text-brand-600 hover:underline"
            >
              Политика
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              ref={acceptBtnRef}
              type="button"
              onClick={() => {
                if (!acceptAll()) {
                  setSaveError(
                    "Не удалось сохранить выбор. Включите cookies в настройках браузера."
                  );
                }
              }}
              className="px-4 py-3 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 rounded-lg transition-colors motion-reduce:transition-none flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" aria-hidden />
              Принять всё
            </button>
            <button
              type="button"
              onClick={() => {
                if (!declineAll()) {
                  setSaveError(
                    "Не удалось сохранить выбор. Включите cookies в настройках браузера."
                  );
                }
              }}
              className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors motion-reduce:transition-none cursor-pointer"
            >
              Только необходимые
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpenInternal(true)}
              className="px-3 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50 active:bg-brand-100 rounded-lg transition-colors motion-reduce:transition-none flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" aria-hidden />
              Настроить
            </button>
          </div>
          {saveError && (
            <p
              role="alert"
              className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2"
            >
              {saveError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-xl border border-gray-200 ${
        disabled ? "bg-gray-50 opacity-80" : "bg-white hover:border-brand-300 cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 text-brand-500 rounded focus:ring-2 focus:ring-brand-500/30 motion-reduce:transition-none"
        aria-label={title}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </label>
  );
}
