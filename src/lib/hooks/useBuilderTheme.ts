"use client";
import { useCallback, useEffect, useState } from "react";

/**
 * Каталог тем рабочей области (/builder). Светлая полоса: от холодного
 * нейтрального (primer) до самого тёплого светлого (milktea).
 * Тёмно-бежевая полоса (sand → bark): фон темнее карточки milktea,
 * текст остаётся тёмным — структура CSS не меняется. Контраст
 * текста везде ≥ 4.5:1 (AA, проверено скриптом WCAG).
 */
export interface BuilderThemeDef {
  id: string;
  label: string;
  hint: string;
  /** Класс на body (фон за пределами .a2-band). */
  bodyClass: string;
  /** Цвет дот-превью в переключателе. */
  swatch: string;
}

export const BUILDER_THEMES: BuilderThemeDef[] = [
  { id: "light", label: "Светлая", hint: "как обычно", bodyClass: "", swatch: "#eef2f7" },
  { id: "primer", label: "Нейтраль", hint: "холодный серый", bodyClass: "bt-primer", swatch: "#f6f8fa" },
  { id: "warmgray", label: "Тёплый серый", hint: "едва тёплый", bodyClass: "bt-warmgray", swatch: "#e9e6df" },
  { id: "solar", label: "Соларайз", hint: "приглушённый", bodyClass: "bt-solar", swatch: "#eee8d5" },
  { id: "sepia", label: "Сепия", hint: "как в читалках", bodyClass: "bt-sepia", swatch: "#e7dbc0" },
  { id: "kindle", label: "Киндл", hint: "книжный уют", bodyClass: "bt-kindle", swatch: "#eddcb9" },
  { id: "gruvbox", label: "Грувбокс", hint: "медовый", bodyClass: "bt-gruvbox", swatch: "#ebdbb2" },
  { id: "milktea", label: "Милк-ти", hint: "самый тёплый светлый", bodyClass: "bt-milktea", swatch: "#eadfcd" },
  { id: "sand", label: "Песок", hint: "тёмно-бежевый I", bodyClass: "bt-sand", swatch: "#d9cba8" },
  { id: "clay", label: "Глина", hint: "тёмно-бежевый II", bodyClass: "bt-clay", swatch: "#cdb894" },
  { id: "umber", label: "Умбра", hint: "тёмно-бежевый III", bodyClass: "bt-umber", swatch: "#bda87f" },
  { id: "bark", label: "Кора", hint: "самый тёмный", bodyClass: "bt-bark", swatch: "#a89468" },
];

export type BuilderTheme = (typeof BUILDER_THEMES)[number]["id"];

const STORAGE_KEY = "dogovor_builder_theme_v1";

/** Все body-классы тем — для снятия при переключении. */
const BODY_CLASSES = BUILDER_THEMES.map((t) => t.bodyClass).filter(Boolean);

/**
 * Чистая функция выбора стартовой темы (покрыта unit-тестами):
 * сохранённое значение из каталога применяется, всё остальное
 * (включая старые "dark"/"sepia") — светлая тема.
 */
export function resolveInitialTheme(stored: string | null): BuilderTheme {
  const found = BUILDER_THEMES.find((t) => t.id === stored);
  if (found) return found.id;
  // Миграция со старой двухтемной схемы: sepia → sepia (есть в каталоге выше).
  return "light";
}

/**
 * Тема рабочей области конструктора (НЕ документа: превью и печать
 * всегда остаются белыми). Переключает класс body.bt-*
 * + атрибут data-bt, которые красит src/styles/globals.css.
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
    setThemeState(resolveInitialTheme(stored));
  }, []);

  useEffect(() => {
    document.body.classList.remove(...BODY_CLASSES);
    const def = BUILDER_THEMES.find((t) => t.id === theme);
    if (def?.bodyClass) document.body.classList.add(def.bodyClass);
    return () => {
      document.body.classList.remove(...BODY_CLASSES);
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
