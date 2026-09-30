import type { AlertItem, ViewId } from "../lib/types";
import { formatCount } from "../lib/format";
import {
  Bell,
  BookOpen,
  Camera,
  GitCompareArrows,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

const navItems: { id: ViewId; label: string; icon: typeof LayoutDashboard; hint: string }[] = [
  { id: "dashboard", label: "Обзор", icon: LayoutDashboard, hint: "Живая лента изменений" },
  { id: "watchlist", label: "Отслеживаемое", icon: ScrollText, hint: "Ваши страницы под присмотром" },
  { id: "diff", label: "Diff-обозреватель", icon: GitCompareArrows, hint: "Сравнение двух версий" },
  { id: "snapshot", label: "Слепок страницы", icon: BookOpen, hint: "Заверенная копия документа" },
  { id: "alerts", label: "Оповещения", icon: Bell, hint: "Юридические риски" },
  { id: "capture", label: "Новый слепок", icon: Camera, hint: "Сохранить страницу в один клик" },
  { id: "how", label: "Как это работает", icon: ShieldCheck, hint: "Гарантии и приватность" },
];

interface SidebarProps {
  activeView: ViewId;
  onSelect: (view: ViewId) => void;
  alerts: AlertItem[];
  totalSnapshots: number;
  totalPages: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ activeView, onSelect, alerts, totalSnapshots, totalPages, isOpen, onClose }: SidebarProps) => {
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;

  return (
    <>
      {/* Оверлей и панель приподняты над полосой возврата сайта (sticky z-60):
          иначе мобильная шторка уезжает под неё. Десктопный sticky-топ
          опущен на высоту полосы (57px), чтобы шапка сайдбара не пряталась. */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[61] bg-[#1b2438]/45 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[268px] flex-col border-r border-[color:var(--color-line)] bg-[color:var(--color-paper-raised)] transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)]`}
      >
        <div className="flex items-center gap-3 border-b border-[color:var(--color-line)] px-5 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[color:var(--color-ink)] text-[color:var(--color-gold-soft)] shadow-sm">
            <ScrollText size={19} strokeWidth={1.9} />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-[color:var(--color-ink)]">
              Chronoleaf
            </div>
            <div className="mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
              Web notary · v.2.4
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mono px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
            Ваш архив
          </div>
          {navItems.map(({ id, label, icon: Icon, hint }) => {
            const active = id === activeView;
            const badge = id === "alerts" && criticalCount > 0 ? criticalCount : undefined;
            return (
              <button
                key={id}
                onClick={() => {
                  onSelect(id);
                  onClose();
                }}
                className={`group mb-1 flex w-full items-start gap-3 rounded-[10px] px-3 py-2.5 text-left transition ${
                  active
                    ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper)] shadow-[0_10px_28px_-16px_rgba(27,36,56,0.55)]"
                    : "text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-sunk)]"
                }`}
              >
                <Icon
                  size={17}
                  strokeWidth={1.7}
                  className={active ? "mt-[2px] text-[color:var(--color-gold-soft)]" : "mt-[2px] text-[color:var(--color-ink-mute)]"}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[13px] font-medium leading-tight">
                    <span className="truncate">{label}</span>
                    {badge !== undefined && (
                      <span className={`mono ml-auto flex h-5 min-w-[22px] items-center justify-center rounded-full px-1 text-[10.5px] font-medium ${
                        active
                          ? "bg-[color:var(--color-gold-soft)] text-[color:var(--color-ink)]"
                          : "bg-[color:var(--color-critical)]/10 text-[color:var(--color-critical)]"
                      }`}>
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className={`mt-0.5 text-[11px] leading-snug ${active ? "text-[color:var(--color-gold-soft)]/80" : "text-[color:var(--color-ink-mute)]"}`}>
                    {hint}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="mx-4 mb-4 rounded-[12px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-4">
          <div className="mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">
            Состояние архива
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="mono text-[24px] font-medium leading-none text-[color:var(--color-ink)]">
              {formatCount(totalSnapshots)}
            </div>
            <div className="text-[11.5px] text-[color:var(--color-ink-mute)]">слепков</div>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11.5px] text-[color:var(--color-ink-soft)]">
            <span className="severity-dot severity-dot--info" />
            <span>{totalPages} страниц под контролем</span>
          </div>
          <div className="mt-3 border-t border-[color:var(--color-line-soft)] pt-3 text-[11px] leading-snug text-[color:var(--color-ink-mute)]">
            Каждый слепок подписан SHA-256 и сохранён на вашем устройстве.
          </div>
        </div>
      </aside>
    </>
  );
};
