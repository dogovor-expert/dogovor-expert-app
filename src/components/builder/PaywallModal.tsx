"use client";
import { Download, Flame } from "lucide-react";
import { currentProPrice, PRO_PRICE_OLD, PROMO_LABEL, isPromoActive, promoCountdownTarget, formatRub } from "@/lib/pricing";
import CountdownTimer from "@/components/billing/CountdownTimer";
import { Modal } from "@/components/ui/Modal";
import { track, goals } from "@/lib/analytics";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** Result-first: даёт free-пользователю сразу скачать PDF с пометкой сервиса. */
  onDownloadFreePdf?: () => void;
}

export default function PaywallModal({ isOpen, onClose, title = "Экспорт в DOCX — функция PRO", onDownloadFreePdf }: PaywallModalProps) {
  const promo = isPromoActive();
  const price = currentProPrice();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton
      closeOnOverlayClick
      closeOnEscape
    >
      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
        Бесплатный тариф скачивает документ в PDF с пометкой сервиса. Подписка
        PRO снимает пометку и открывает экспорт в Word (DOCX), подсказки
        адресов и другие возможности.
      </p>
      {promo ? (
        <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold">
              <Flame className="w-3 h-3" />
              Акция {PROMO_LABEL}
            </span>
            <span className="text-xs font-bold">
              {formatRub(price)}
              <span className="ml-1.5 text-sm font-semibold opacity-60 line-through">
                {formatRub(PRO_PRICE_OLD)}
              </span>
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] opacity-90">
            <span>Скидка до конца акции:</span>
            <CountdownTimer endsAt={promoCountdownTarget()} compact className="font-bold tabular-nums" />
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-600 mt-1.5">Подписка PRO — {formatRub(price)}/мес.</p>
      )}
      <div className="flex gap-2 mt-5">
        <a
          href="/billing"
          className="flex-1 text-center px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-bold text-xs transition"
        >
          {promo ? `Оформить PRO за ${formatRub(price)}` : "Оформить PRO"}
        </a>
        <button
          onClick={onClose}
          className="px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 text-xs font-medium transition border border-gray-200"
        >
          Пока нет
        </button>
      </div>
      {onDownloadFreePdf && (
        <button
          onClick={() => {
            track(goals.exportPdf, { source: "paywall_free" });
            onDownloadFreePdf();
            onClose();
          }}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl text-xs font-semibold transition border border-brand-100"
        >
          <Download className="w-3.5 h-3.5" />
          Скачать PDF с пометкой (бесплатно)
        </button>
      )}
    </Modal>
  );
}