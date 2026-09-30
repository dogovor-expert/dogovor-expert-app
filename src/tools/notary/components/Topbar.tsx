import { AlarmClock, Command, Menu, ShieldCheck } from "lucide-react";

interface TopbarProps {
  onOpenNav: () => void;
  onCapture: () => void;
  onOpenAlerts: () => void;
  criticalCount: number;
}

export const Topbar = ({ onOpenNav, onCapture, onOpenAlerts, criticalCount }: TopbarProps) => {
  return (
    <div className="sticky top-0 z-20 border-b border-[color:var(--color-line)] bg-[color:var(--color-paper)]/85 backdrop-blur">
      <div className="flex items-center gap-3 px-5 py-3 lg:px-8">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Открыть меню"
          className="grid h-9 w-9 place-items-center rounded-[8px] border border-[color:var(--color-line)] bg-[color:var(--color-paper-raised)] text-[color:var(--color-ink)] lg:hidden"
        >
          <Menu size={16} />
        </button>

        <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper-raised)] px-3 py-2 md:flex">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink-mute)]">
            URL
          </div>
          <div className="mono truncate text-[12.5px] text-[color:var(--color-ink-soft)]">
            atlas-market.example/help/refund-policy
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[color:var(--color-ink-mute)]">
            <span className="severity-dot severity-dot--info" />
            <span>Заверено · 14 мая 2026, 09:12</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAlerts}
            className="relative hidden items-center gap-2 rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper-raised)] px-3 py-2 text-[12.5px] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]/25 sm:inline-flex"
          >
            <AlarmClock size={15} strokeWidth={1.7} />
            <span>Оповещения</span>
            {criticalCount > 0 && (
              <span className="mono flex h-[18px] min-w-[22px] items-center justify-center rounded-full bg-[color:var(--color-critical)]/12 px-1 text-[10.5px] font-medium text-[color:var(--color-critical)]">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onCapture}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[color:var(--color-ink)] px-3.5 py-2 text-[12.5px] font-medium text-[color:var(--color-paper)] transition hover:bg-[color:var(--color-ink)]/90"
          >
            <ShieldCheck size={15} strokeWidth={1.9} />
            <span>Заверить страницу</span>
            <span className="mono ml-1 hidden items-center gap-1 rounded-md border border-[color:var(--color-paper)]/25 px-1.5 py-[1.5px] text-[10px] uppercase tracking-wider text-[color:var(--color-paper)]/85 sm:inline-flex">
              <Command size={10} /> S
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
