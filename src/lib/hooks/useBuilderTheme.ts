"use client";
import { useCallback, useEffect, useState } from "react";

export type BuilderTheme = "light" | "sepia" | "dark";

const STORAGE_KEY = "dogovor_builder_theme_v1";

/**
 * Чистая функция выбора стартовой темы (покрыта unit-тестами):
 * сохранённое значение важнее всего, без него — системная тема.
 */
export function resolveInitialTheme(
  stored: string | null,
  prefersDark: boolean
): BuilderTheme {
  if (stored === "sepia" || stored === "dark" || stored === "light") {
    return stored;
  }
  return prefersDark ? "dark" : "light";
}

/**
 * Тема рабочей области конструктора (НЕ документа: превью и печать
 * всегда остаются белыми). Переключает классы body (bt-dark/bt-sepia),
 * которые красит src/styles/globals.css в скоупе [data-bt].
 * Выбор сохраняется в localStorage и переживает перезагрузку.
 */
export function useBuilderTheme() {
  const [theme, setThemeState] = useState<BuilderTheme>("light");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // приватный режим — игнорируем
    }
    const prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setThemeState(resolveInitialTheme(stored, prefersDark));
  }, []);

  useEffect(() => {
    document.body.classList.toggle("bt-dark", theme === "dark");
    document.body.classList.toggle("bt-sepia", theme === "sepia");
    return () => {
      document.body.classList.remove("bt-dark", "bt-sepia");
    };
  }, [theme]);

  const setTheme = useCallback((t: BuilderTheme) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // приватный режим — игнорируем
    }
  }, []);

  return { theme, setTheme };
}
