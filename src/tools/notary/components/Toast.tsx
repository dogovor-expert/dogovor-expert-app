import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export const Toast = ({ message, onDismiss }: ToastProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        window.setTimeout(onDismiss, 220);
      }, 3200);
      return () => clearTimeout(timer);
    }
    setVisible(false);
    return undefined;
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-[12px] border border-[color:var(--color-line)] bg-[color:var(--color-ink)] px-4 py-2.5 text-[12.5px] text-[color:var(--color-paper)] shadow-[0_20px_45px_-20px_rgba(27,36,56,0.55)]">
        <CheckCircle2 size={15} strokeWidth={1.9} className="text-[color:var(--color-gold-soft)]" />
        <span>{message}</span>
        <button
          type="button"
          aria-label="Закрыть уведомление"
          onClick={() => {
            setVisible(false);
            window.setTimeout(onDismiss, 220);
          }}
          className="ml-2 text-[color:var(--color-paper)]/70 transition hover:text-[color:var(--color-paper)]"
        >
          <X size={14} strokeWidth={1.9} />
        </button>
      </div>
    </div>
  );
};
