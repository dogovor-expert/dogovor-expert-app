"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Printer, Send } from "lucide-react";
import { useScrollContainer, scrollerSize } from "@/hooks/useScrollContainer";

export interface TocItem {
  id: string;
  label: string;
}

/** Оглавление статьи: scroll-spy + поделиться (копия / Telegram / печать). */
export function BlogToc({ items, className }: { items: TocItem[]; className?: string }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const { nodeRef, scroller } = useScrollContainer<HTMLElement>();

  useEffect(() => {
    if (!scroller || items.length === 0) return;
    let timeout: ReturnType<typeof setTimeout>;
    const update = () => {
      let current = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) break;
        if (el.getBoundingClientRect().top < 120) current = item.id;
      }
      const { el, max } = scrollerSize(scroller);
      if (max > 0 && el.scrollTop >= max - 8) {
        current = items[items.length - 1].id;
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(update, 60);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(timeout);
    };
  }, [items, scroller]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <aside ref={nodeRef} className={className}>
      <div className="sticky top-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          В этой статье
        </p>
        <nav className="mt-3 border-l-2 border-gray-100">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block border-l-2 py-1.5 pl-3 text-[13px] leading-snug transition ${
                activeId === item.id
                  ? "-ml-px border-brand-600 font-semibold text-brand-700"
                  : "-ml-px border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-6 flex items-center gap-1.5">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Поделиться
          </span>
          <button
            type="button"
            onClick={() => {
              void copyLink();
            }}
            aria-label="Скопировать ссылку"
            title="Скопировать ссылку"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-brand-50 hover:text-brand-600"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}`, "_blank", "noopener")}
            aria-label="Отправить в Telegram"
            title="Отправить в Telegram"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-sky-50 hover:text-sky-600"
          >
            <Send className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Печать"
            title="Печать"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}