import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface ToolRowProps {
  /** Совпадает с ключом collapsedSections (состояние сворачивания переживает перезагрузку). */
  id: string;
  /** Эмодзи-пиктограмма плитки (как в макете A2). */
  tile: string;
  /** Тон плитки: t-blue | t-amber | t-green | t-violet | t-rose
   * (маппится на a2-t-* из globals.css, как в макете A2). */
  tint: string;
  title: string;
  sub: string;
  /** PRO-бейдж вместо шеврона. */
  locked?: boolean;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}

/**
 * Строка-аккордеон инструментов в рельсе A2 («Гид Премиум»):
 * плитка + заголовок + подзаголовок + PRO-бейдж/шеврон,
 * контент раскрывается внутри карточки инструментов.
 */
export default function ToolRow({
  id,
  tile,
  tint,
  title,
  sub,
  locked,
  expanded,
  onToggle,
  children,
}: ToolRowProps) {
  // tint из page.tsx ("t-amber") → класс CSS ("a2-t-amber"):
  // в globals.css определены только a2-t-*, голый t-* фона не даёт.
  const tintClass = tint.startsWith("a2-") ? tint : `a2-${tint}`;
  return (
    <div>
      <button
        type="button"
        className="a2-tool px-1 py-[9px]"
        aria-expanded={expanded}
        onClick={() => onToggle(id)}
      >
        <span className={`a2-tile ${tintClass}`} aria-hidden="true">
          {tile}
        </span>
        <span className="min-w-0">
          <b>{title}</b>
          <small>{sub}</small>
        </span>
        {locked ? (
          <span className="a2-lock">PRO</span>
        ) : (
          <ChevronDown className="a2-chev w-4 h-4" aria-hidden="true" />
        )}
      </button>
      {expanded && <div className="px-1 pb-3 pt-1">{children}</div>}
    </div>
  );
}
