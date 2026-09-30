"use client";
/**
 * Мобильная нижняя таб-панель (<lg). 5 разделов:
 *   Главная · Шаблоны · Создать · Документы · Профиль
 *
 * Назначение: «свой» навигационный паттерн для мобильных. Не PWA, не
 * install — только адаптивный UI. Скрывается:
 *  - на десктопе (>= lg / 1024px)
 *  - в /admin (своё меню)
 *  - на /builder/export-pdf (полноэкранный режим)
 *
 * Поведение скрытия:
 *  - при скролле вниз — уезжает вниз (translate), экономя вертикальное место
 *  - при скролле вверх — возвращается
 *  - при фокусе внутри input/textarea/select — скрывается (iOS-клавиатура)
 *
 * Safe-area: padding-bottom = pb-safe (env safe-area-inset-bottom) — см.
 * globals.css. Высота — 56px (touch-target ≥ 44 для иконок).
 */
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, FilePlus, FolderOpen, User } from "lucide-react";
import { getAllDrafts } from "@/lib/autosave";

type Item = {
  href: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
};

const ITEMS: Item[] = [
  { href: "/", label: "Главная", icon: Home, exact: true },
  { href: "/templates", label: "Шаблоны", icon: LayoutGrid },
  { href: "/builder", label: "Создать", icon: FilePlus },
  { href: "/documents", label: "Документы", icon: FolderOpen },
  { href: "/settings", label: "Профиль", icon: User },
];

const HIDE_ROUTES = ["/admin", "/builder/export-pdf", "/login", "/signup"];

function isHiddenRoute(pathname: string): boolean {
  return HIDE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [draftCount, setDraftCount] = useState(0);
  const lastY = useRef(0);

  // Прячем если открыта клавиатура на мобильных (iOS-фокус на input).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const tag = t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable) {
        setHidden(true);
      }
    };
    const onFocusOut = (e: FocusEvent) => {
      const t = e.relatedTarget as HTMLElement | null;
      if (!t) return;
      const tag = t.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT" && !t.isContentEditable) {
        setHidden(false);
      }
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // Счётчик черновиков — синхронизируем с фокусом и storage.
  useEffect(() => {
    const refresh = () => {
      try {
        setDraftCount(getAllDrafts().length);
      } catch {
        setDraftCount(0);
      }
    };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", (e) => {
      if (e.key?.startsWith("dogovor_draft_")) refresh();
    });
    window.addEventListener("dogovor:draft-update", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("dogovor:draft-update", refresh);
    };
  }, [pathname]);

  // Скрытие при скролле вниз. Скролл живёт внутри main (app-shell),
  // window.scrollY там всегда 0 — слушаем скроллер напрямую.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const scroller: Element | Window = document.querySelector("main") ?? window;
    const getY = () => (scroller instanceof Window ? scroller.scrollY : scroller.scrollTop);
    const onScroll = () => {
      const y = getY();
      const delta = y - lastY.current;
      if (Math.abs(delta) > 8) {
        if (delta > 0 && y > 80) setHidden(true);
        else setHidden(false);
        lastY.current = y;
      }
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  if (isHiddenRoute(pathname)) return null;

  return (
    <nav
      role="navigation"
      aria-label="Мобильная навигация"
      className={`fixed inset-x-0 bottom-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 pb-safe transition-transform duration-200 will-change-transform ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <ul className="grid grid-cols-5 h-14">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          const Icon = item.icon;
          const showBadge = item.href === "/documents" && draftCount > 0;
          return (
            <li key={item.href} className="contents">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] text-[11px] font-medium transition-colors ${
                  active
                    ? "text-brand-600"
                    : "text-gray-500 hover:text-gray-900 active:text-brand-700"
                }`}
              >
                <span
                  className={`relative flex items-center justify-center w-7 h-7 rounded-xl transition-colors ${
                    active ? "bg-brand-50" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden />
                  {showBadge && (
                    <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-brand-500 text-white rounded-full flex items-center justify-center">
                      {draftCount > 9 ? "9+" : draftCount}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
