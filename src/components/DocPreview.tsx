"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { getDesign, type DesignId } from "@/lib/docDesign";

const A4_W = 794;
const A4_H = 1123;
const MM_TO_PX = 3.7795;

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
  /** Дизайн документа (Классика / Деловой минимализм / Фирменный). */
  design?: DesignId;
  /** Водяной знак бесплатного тарифа (рисуется в подвале). */
  watermark?: string;
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
  design,
  watermark,
}: DocPreviewProps) {
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<DocPage[]>([]);

  const designTokens = getDesign(design);
  const ml = Math.round(designTokens.marginLeft * MM_TO_PX);
  const mr = Math.round(designTokens.marginRight * MM_TO_PX);
  const mt = Math.round(designTokens.marginTop * MM_TO_PX);
  const strong = designTokens.logoWeight === "strong";
  const wordColor = strong ? "#" + designTokens.accent : "#26262b";
  const wordSize = Math.round((strong ? designTokens.smallFontSize : designTokens.tinyFontSize) * 4 / 3);
  const tagSize = Math.round(designTokens.tinyFontSize * 0.9 * 4 / 3);
  const ruleColor = "#" + designTokens.ruleColor;
  const grayColor = "#" + designTokens.grayText;
  const headerAlign =
    designTokens.headerAlign === "center"
      ? "center"
      : designTokens.headerAlign === "right"
        ? "right"
        : "left";

  const renderChrome = (i: number, total: number) => (
    <>
      <div
        className="doc-preview-header"
        style={{ paddingLeft: ml, paddingRight: mr, paddingTop: Math.max(6, mt - 26), textAlign: headerAlign }}
      >
        <div style={{ fontWeight: 700, fontSize: wordSize, color: wordColor, lineHeight: 1.1 }}>
          {designTokens.wordmark}
        </div>
        <div style={{ fontSize: tagSize, color: grayColor, lineHeight: 1.2 }}>
          {designTokens.tagline}
        </div>
        {designTokens.id !== "classic" && (
          <div style={{ borderTop: `0.5px solid ${ruleColor}`, marginTop: 4 }} />
        )}
      </div>
      <div
        className="doc-preview-footer"
        style={{ paddingLeft: ml, paddingRight: mr, paddingBottom: 10 }}
      >
        {watermark && (
          <div style={{ textAlign: "center", fontSize: tagSize, color: "#8b8b93", marginBottom: 2 }}>
            {watermark}
          </div>
        )}
        <div
          style={{
            borderTop: `0.5px solid ${ruleColor}`,
            paddingTop: 4,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: grayColor,
          }}
        >
          <span>{showPageNumbers ? `Стр. ${i + 1} из ${total}` : ""}</span>
          <span>Сформировано на {designTokens.siteUrl}</span>
        </div>
      </div>
    </>
  );

  useLayoutEffect(() => {
    if (!html) return;

    const measure = document.createElement("div");
    measure.className = "a4-sheet";
    measure.style.cssText = `position:absolute;left:-100000px;top:0;visibility:hidden;pointer-events:none;`;
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

      const isHeadingBlock = (el: HTMLElement | null): boolean => {
        if (!el) return false;
        const cls = el.className || "";
        return cls.includes("font-bold") && (cls.includes("uppercase") || cls.includes("text-xs"));
      };
      const blockHeight = (el: HTMLElement): number => {
        const style = window.getComputedStyle(el);
        return (
          el.offsetHeight +
          (parseFloat(style.marginTop) || 0) +
          (parseFloat(style.marginBottom) || 0)
        );
      };

      children.forEach((child, idx) => {
        const h = blockHeight(child);
        const isLast = idx === children.length - 1;
        const tooBig = h > usable;
        const overflow = group.length > 0 && used + h > usable;

        if (!tooBig && !overflow) {
          group.push(child.outerHTML);
          used += h;
          return;
        }

        // Закрываем текущую группу.
        if (group.length > 0) {
          const prevEl = child.previousElementSibling as HTMLElement | null;
          // Висячий заголовок: не оставляем его последним на странице,
          // уносим на следующую вместе с идущим за ним блоком.
          if (isHeadingBlock(prevEl) && overflow && !tooBig && !isLast && prevEl) {
            const hdr = group.pop()!;
            used -= blockHeight(prevEl);
            collected.push({ rootClass: root.className, html: group.join("") });
            group = [hdr];
            used = blockHeight(prevEl);
          } else {
            collected.push({ rootClass: root.className, html: group.join("") });
            group = [];
            used = 0;
          }
        }

        // Слишком высокий блок (напр., длинная таблица) — отдельная страница.
        if (tooBig) {
          collected.push({ rootClass: root.className, html: child.outerHTML });
          return;
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
        <div className={`a4-sheet doc-skin-${designTokens.id}`}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
          {renderChrome(0, 1)}
        </div>
      </div>
    );
  }

  return (
    <div id="print-root" className="flex flex-col items-center gap-6 py-4">
      {pages.map((page, i) => (
        <div key={i} className={`a4-sheet doc-skin-${designTokens.id}`}>
          <div
            className={page.rootClass}
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
          {renderChrome(i, pages.length)}
        </div>
      ))}
    </div>
  );
}