"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Calculator, StickyNote } from "lucide-react";
import HeaderPanel from "@/components/layout/HeaderPanel";
import HeaderCalculatorPanel from "@/components/layout/HeaderCalculatorPanel";
import HeaderCalendarPanel from "@/components/layout/HeaderCalendarPanel";
import HeaderNotesPanel from "@/components/layout/HeaderNotesPanel";
import { pendingCount, loadNotes } from "@/lib/header-notes";

type PanelId = "calc" | "calendar" | "notes" | null;

/**
 * Три быстрых инструмента в шапке: калькулятор, календарь и заметки.
 *
 * Панель открывается по кнопке, закрывается повторным кликом, Escape или кликом
 * вне. Открыта не более одной панели. Всё работает без входа в аккаунт.
 */
export default function HeaderTools() {
  const [open, setOpen] = useState<PanelId>(null);
  const [pending, setPending] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setPending(pendingCount(loadNotes()));
  }, []);

  // Напоминание могло сработать, пока панель была закрыта — держим счётчик свежим.
  useEffect(() => {
    const sync = () => setPending(pendingCount(loadNotes()));
    const id = window.setInterval(sync, 30_000);
    window.addEventListener("focus", sync);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const toggle = (id: Exclude<PanelId, null>) => {
    setOpen((cur) => {
      if (cur === id) {
        buttonRefs.current[id]?.focus();
        return null;
      }
      return id;
    });
  };

  const close = () => {
    setOpen((cur) => {
      buttonRefs.current[cur ?? ""]?.focus();
      return null;
    });
  };

  const BTNS = [
    { id: "calc" as const, label: "Калькулятор", Icon: Calculator },
    { id: "calendar" as const, label: "Календарь", Icon: CalendarDays },
    { id: "notes" as const, label: "Заметки и напоминания", Icon: StickyNote },
  ];

  return (
    <div className="relative flex items-center gap-0.5" ref={wrapRef}>
      {BTNS.map(({ id, label, Icon }) => {
        const isOpen = open === id;
        return (
          <button
            key={id}
            ref={(el) => {
              buttonRefs.current[id] = el;
            }}
            type="button"
            onClick={() => toggle(id)}
            aria-expanded={isOpen}
            aria-controls={`header-panel-${id}`}
            aria-label={label}
            title={label}
            className={`relative rounded-xl p-2 transition-colors ${
              isOpen ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {id === "notes" && pending > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                {pending > 9 ? "9+" : pending}
              </span>
            )}
          </button>
        );
      })}

      {open === "calc" && (
        <HeaderPanel id="header-panel-calc" label="Калькулятор" open onClose={close}>
          <HeaderCalculatorPanel />
        </HeaderPanel>
      )}
      {open === "calendar" && (
        <HeaderPanel id="header-panel-calendar" label="Календарь" open onClose={close}>
          <HeaderCalendarPanel />
        </HeaderPanel>
      )}
      {open === "notes" && (
        <HeaderPanel id="header-panel-notes" label="Заметки и напоминания" open onClose={close}>
          <HeaderNotesPanel onNotifyChange={setPending} />
        </HeaderPanel>
      )}
    </div>
  );
}