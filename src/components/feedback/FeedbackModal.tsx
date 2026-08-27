"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";

// Тяжёлую форму грузим лениво — только при открытии модалки,
// чтобы не тянуть её (и зависимости) на каждую страницу.
const FeedbackForm = dynamic(() => import("./FeedbackForm"), {
  ssr: false,
  loading: () => <div className="p-6 text-sm text-slate-600">Загрузка формы…</div>,
});

export default function FeedbackModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 lg:left-[17rem] z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition-colors"
        aria-label="Сообщить о проблеме"
      >
        <span className="text-lg leading-none">💬</span>
        <span className="text-sm font-semibold hidden sm:inline">Сообщить о проблеме</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between rounded-t-3xl">
              <h2 className="font-bold text-slate-900">Обратная связь</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <FeedbackForm compact onSuccess={() => setTimeout(() => setOpen(false), 2500)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
