import { Crown, Flame, X } from "lucide-react";
import { currentProPrice, PRO_PRICE_OLD, PROMO_LABEL, isPromoActive, promoCountdownTarget, formatRub } from "@/lib/pricing";
import CountdownTimer from "@/components/billing/CountdownTimer";

interface PaywallModalProps {
  onClose: () => void;
}

export default function PaywallModal({ onClose }: PaywallModalProps) {
  const promo = isPromoActive();
  const price = currentProPrice();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Crown className="h-5 w-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="text-base font-bold text-gray-900 mt-3">
          Экспорт в DOCX — функция PRO
        </h3>
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
      </div>
    </div>
  );
}