"use client";
/**
 * Поповер «Экспорт в облако» для строки документа.
 *
 * Почему портал: таблица документов лежит в контейнере с overflow-x-auto,
 * который обрезает абсолютные поповеры и ломает hover/клик у краёв.
 * Рендерим в body через createPortal и позиционируем по rect кнопки,
 * с авто-переворотом вверх, если снизу нет места.
 *
 * Закрытие: Esc, клик/тап вне (проверка по ref, а не stopPropagation —
 * прежний вариант со stopPropagation пропускал mousedown и закрывал
 * меню до срабатывания кнопки).
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Cloud, Upload, FileDown, Settings2, ChevronUp } from "lucide-react";

/* ------------------------- Брендовые иконки ------------------------- */

export function YandexDiskIcon({ className = "w-4 h-4" }: { className?: string }) {
  // Фирменный красный Яндекс + стилизованный «диск»-полумесяц
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#FC3F1D" />
      <path
        d="M13.6 18.5v-5.9h-.28l-2.62 5.06a1.1 1.1 0 0 1-.98.84H8.1c-.55 0-.86-.63-.53-1.07L11.7 12 8.3 6.57c-.33-.44-.02-1.07.53-1.07h1.62c.44 0 .83.26 1.02.66L13.32 10h.28V6.6c0-.59.48-1.07 1.07-1.07h1.06c.59 0 1.07.48 1.07 1.07v11.9c0 .59-.48 1.07-1.07 1.07h-1.06c-.59 0-1.07-.48-1.07-1.07Z"
        fill="#fff"
      />
    </svg>
  );
}

export function GoogleDriveIcon({ className = "w-4 h-4" }: { className?: string }) {
  // Классический треугольник Drive в фирменных цветах
  return (
    <svg viewBox="0 0 87.3 78" className={className} aria-hidden="true">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44A9.06 9.06 0 0 0 0 53h27.5z" fill="#00ac47" />
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.798l5.852 11.5z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}

export function DropboxIcon({ className = "w-4 h-4" }: { className?: string }) {
  // Фирменный синий + четыре ромба DropBox
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#0061FF" />
      <path
        d="M7.3 6.2 12 9.2 7.3 12.2 2.6 9.2 7.3 6.2Zm9.4 0 4.7 3-4.7 3-4.7-3 4.7-3ZM2.6 15.2l4.7-3 4.7 3-4.7 3-4.7-3Zm14.1-3 4.7 3-4.7 3-4.7-3 4.7-3ZM7.3 19.2l4.7-3 4.7 3-4.7 3-4.7-3Z"
        transform="translate(0 -1)"
        fill="#fff"
      />
    </svg>
  );
}

export function ProviderIcon({ id, className }: { id: string; className?: string }) {
  if (id === "yandex") return <YandexDiskIcon className={className} />;
  if (id === "google") return <GoogleDriveIcon className={className} />;
  if (id === "dropbox") return <DropboxIcon className={className} />;
  return <Cloud className={className} />;
}

/* --------------------------- Поповер --------------------------- */

export interface CloudExportProvider {
  id: string;
  name: string;
}

interface CloudExportMenuProps {
  /** Провайдеры из подключённых; если пусто — показываем CTA на /connections */
  providers: CloudExportProvider[];
  /** Идёт ли экспорт прямо сейчас (блокирует кнопки, показывает спиннер) */
  busy?: boolean;
  /** Выбор формата для конкретного провайдера */
  onPick: (providerId: string, providerName: string, format: "vault-backup" | "pdf") => void;
  /** Переход к управлению дисками */
  onManage: () => void;
  /** Текст тултипа на кнопке-триггере */
  triggerTitle?: string;
  /** Если подписка не PRO, действия вместо экспорта вызывают onUpgrade (шлюз) */
  subscriptionActive?: boolean;
  onUpgrade?: () => void;
}

const MENU_W = 264;

export default function CloudExportMenu({
  providers,
  busy,
  onPick,
  onManage,
  triggerTitle,
  subscriptionActive = false,
  onUpgrade,
}: CloudExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const hEstimate = 300; // приблизительно; достаточно для решения о перевороте
    let left = Math.min(Math.max(8, r.right - MENU_W), window.innerWidth - MENU_W - 8);
    let top = r.bottom + 8;
    if (top + hEstimate > window.innerHeight - 8 && r.top - hEstimate - 8 > 8) {
      top = r.top - hEstimate - 8;
    }
    setPos({ left, top });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScrollOrResize = () => place();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, place]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={`p-1.5 rounded-lg transition-colors ${
          open ? "bg-brand-100 text-brand-600" : "hover:bg-gray-100 text-gray-600"
        }`}
        title={triggerTitle ?? "Экспорт в облако"}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Cloud className="w-4 h-4" />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ left: pos.left, top: pos.top, width: MENU_W }}
            className="fixed z-[70] rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 p-2 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 pt-1 pb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Экспорт документа
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-300 hover:text-gray-500 transition-colors"
                title="Закрыть"
              >
                <ChevronUp className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            {providers.length === 0 ? (
              <button
                onClick={() => {
                  setOpen(false);
                  if (!subscriptionActive) {
                    onUpgrade?.();
                    return;
                  }
                  onManage();
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Cloud className="w-4 h-4 text-brand-500" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-gray-800">Облако не подключено</span>
                  <span className="block text-xs text-gray-500">Яндекс · Google · Dropbox</span>
                </span>
              </button>
            ) : (
              <ul className="space-y-1">
                {providers.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <ProviderIcon id={p.id} className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-medium text-gray-700 w-[74px] truncate flex-shrink-0">
                      {p.name}
                    </span>
                    <span className="ml-auto flex items-center gap-1">
                      <button
                        disabled={busy}
                        onClick={() => {
                          setOpen(false);
                          if (!subscriptionActive) {
                            onUpgrade?.();
                            return;
                          }
                          onPick(p.id, p.name, "vault-backup");
                        }}
                        title="Зашифрованная резервная копия (.json)"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 disabled:opacity-50 transition-colors"
                      >
                        <Upload className="w-3 h-3" />
                        Бэкап
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => {
                          setOpen(false);
                          if (!subscriptionActive) {
                            onUpgrade?.();
                            return;
                          }
                          onPick(p.id, p.name, "pdf");
                        }}
                        title="PDF-копия документа"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                      >
                        <FileDown className="w-3 h-3" />
                        PDF
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-gray-100 mt-1.5 pt-1.5">
              <button
                onClick={() => {
                  setOpen(false);
                  if (!subscriptionActive) {
                    onUpgrade?.();
                    return;
                  }
                  onManage();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5 text-gray-400" />
                Управление дисками…
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}