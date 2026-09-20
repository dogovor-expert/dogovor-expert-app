"use client";
import { useCallback, useEffect, useState } from "react";

export type SidebarTheme = "light" | "dark";

const STORAGE_KEY = "dogovor_sidebar_theme_v1";

function readStored(): SidebarTheme {
  if (typeof window === "undefined") return "dark";
  try {
    // Тёмная тема — по умолчанию; светлую пользователь выбирает вручную.
    return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/**
 * Тема ТОЛЬКО левого меню (сайдбара). Светлая — как раньше, тёмная — как в
 * макете variant-b. Структура/содержимое меню не меняются, только цветовые
 * токены. Выбор сохраняется в localStorage и переживает перезагрузку.
 */
export function useSidebarTheme() {
  const [theme, setTheme] = useState<SidebarTheme>("dark");

  // Гидратация: читаем сохранённое значение после монтирования; тёмная —
  // значение по умолчанию, поэтому серверный и первый клиентский рендер совпадают.
  useEffect(() => {
    setTheme(readStored());
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: SidebarTheme = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // приватный режим — игнорируем
      }
      return next;
    });
  }, []);

  return { theme, toggle, isDark: theme === "dark" };
}