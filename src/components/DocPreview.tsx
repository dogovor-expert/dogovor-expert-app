"use client";

import { useLayoutEffect, useRef, useState } from "react";

const A4_W = 794;
const A4_H = 1123;

export interface DocPage {
  rootClass: string;
  html: string;
}

interface DocPreviewProps {
  /** Полный HTML-разметка документа (рендер шаблона), включая обёртку. */
  html: string;
  /** Отрендерить средствами печатного движка (страницы, номера). */
  showPageNumbers?: boolean;
  /** Сообщить родителю число страниц, когда разметка изменится. */
  onPagesChange?: (count: number) => void;
}

/**
 * Постраничный движок предпросмотра A4.
 * Измеряет блоки документа в скрытом контейнере и разбивает поток на листы,
 * каждый лист — точная копия того, что будет на печати (210×297 мм).
 */
export default function DocPreview({
  html,
  showPageNumbers = true,
  onPagesChange,
}: DocPreviewProps) {
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<DocPage[]>([]);

  useLayoutEffect(() => {
    if (!html) return;

    const measure = document.createElement("div");
    measure.style.cssText = `position:absolute;left:-100000px;top:0;width:${A4_W}px;visibility:hidden;pointer-events:none;`;
    measure.innerHTML = html;
    document.body.appendChild(measure);

    const root = measure.firstElementChild as HTMLElement | null;
    const collected: DocPage[] = [];

    if (root) {
      const cs = window.getComputedStyle(root);
      const padTop = parseFloat(cs.paddingTop) || 0;
      const padBottom = parseFloat(cs.paddingBottom) || 0;
      const usable = A4_H - padTop - padBottom;

      const children = Array.from(root.children) as HTMLElement[];
      let group: string[] = [];
      let used = 0;

      children.forEach((child) => {
        const h = child.offsetHeight;
        // Слишком высокий блок (напр., длинная таблица) — отдельная страница.
        if (h > usable) {
          if (group.length) {
            collected.push({ rootClass: root.className, html: group.join("") });
            group = [];
            used = 0;
          }
          collected.push({ rootClass: root.className, html: child.outerHTML });
          return;
        }
        if (used + h > usable && group.length) {
          collected.push({ rootClass: root.className, html: group.join("") });
          group = [];
          used = 0;
        }
        group.push(child.outerHTML);
        used += h;
      });

      if (group.length) {
        collected.push({ rootClass: root.className, html: group.join("") });
      }

      if (collected.length === 0 && root) {
        collected.push({ rootClass: root.className, html: root.innerHTML });
      }
    }

    document.body.removeChild(measure);
    setPages(collected);
    onPagesChange?.(collected.length || 1);
  }, [html, onPagesChange]);

  if (pages.length === 0) {
    return (
      <div id="print-root" className="flex flex-col items-center gap-6 py-4">
        <div
          className="a4-sheet"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  return (
    <div id="print-root" className="flex flex-col items-center gap-6 py-4">
      {pages.map((page, i) => (
        <div key={i} className="a4-sheet">
          <div
            className={page.rootClass}
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
          {showPageNumbers && (
            <span className="a4-page-number">
              Стр. {i + 1} из {pages.length}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}