"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Аккордеон FAQ в стиле макета: один раскрытый пункт, плавное раскрытие. */
export function ResumeFaq({ items }: { items: Array<{ q: string; a: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-12 space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={item.q}
            className={cn(
              "overflow-hidden rounded-2xl border bg-white transition",
              isOpen ? "border-indigo-200 shadow-md shadow-indigo-900/5" : "border-slate-200",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="text-sm font-bold text-slate-900 sm:text-base">{item.q}</span>
              <Plus
                className={cn(
                  "h-5 w-5 shrink-0 text-indigo-600 transition-transform duration-300",
                  isOpen && "rotate-45",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-xs leading-relaxed text-slate-500 sm:text-sm">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
