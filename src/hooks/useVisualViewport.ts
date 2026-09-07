"use client";

/**
 * iOS Safari не поддерживает interactive-widget=resizes-content (см. viewport
 * meta в layout.tsx). Единственный кросс-платформенный механизм удержать
 * активное поле над виртуальной клавиатурой — window.visualViewport.
 *
 * Хук возвращает высоту видимой области (visual viewport height) и текущий
 * offsetTop клавиатуры. Подписка на resize/scroll отличается от обычного
 * viewport: при открытой клавиатуре height уменьшается. На десктопе и в
 * Chromium (который сам ресайзится) значения равны layout viewport — хук
 * безопасен и не активен.
 *
 * Возвращает 0, пока значение не определено (SSR-safe).
 */
import { useEffect, useState } from "react";

interface VisualViewportState {
  /** Высота видимой области, px. */
  height: number;
  /** Реальная высота layout viewport, px. */
  layoutHeight: number;
  /** Меньше ли видимая область полной (значит, открыта клавиатура). */
  keyboardVisible: boolean;
  /** Сколько пикселей перекрыто клавиатурой (0, если открыта не клавиатура). */
  keyboardInset: number;
}

const supportsVisualViewport = () =>
  typeof window !== "undefined" &&
  typeof window.visualViewport?.height === "number";

function readState(): VisualViewportState {  const layoutHeight = window.innerHeight;
  if (window.visualViewport) {
    const height = window.visualViewport.height;
    // Площадь, скрытая клавиатурой/панелями. Отрицательные значения на
    // некоторых браузерах клампим до 0.
    const inset = Math.max(0, layoutHeight - height - window.visualViewport.offsetTop);
    return {
      height,
      layoutHeight,
      keyboardVisible: inset > 1,
      keyboardInset: inset,
    };
  }
  return { height: layoutHeight, layoutHeight, keyboardVisible: false, keyboardInset: 0 };
}

export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({
    height: 0,
    layoutHeight: 0,
    keyboardVisible: false,
    keyboardInset: 0,
  });

  useEffect(() => {
    if (!supportsVisualViewport()) {
      // Без visualViewport (десктоп/старые браузеры) — равняемся на layout.
      setState(readState());
      return;
    }

    const update = () => setState(readState());
    const vv = window.visualViewport;
    if (!vv) return;

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    // Внешние события (ресайз окна, поворот) тоже меняют картину.
    window.addEventListener("resize", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return state;
}
