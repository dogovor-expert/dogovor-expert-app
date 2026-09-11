"use client";

import { type ReactNode } from "react";
import { Modal } from "./Modal";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Красная (danger) кнопка подтверждения — для необратимых действий. */
  danger?: boolean;
  /** Блокирует кнопки во время выполнения действия. */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Доступный диалог подтверждения поверх переиспользуемого Modal
 * (фокус-ловушка, Escape, aria-modal уже в Modal). Первый фокус
 * попадает на «Отмену» — безопасное значение по умолчанию.
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={busy ? () => {} : onCancel} size="sm" showCloseButton={!busy}>
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <div className="mt-1.5 text-sm text-gray-600 leading-relaxed">{message}</div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60",
              danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700",
            )}
          >
            {busy ? "Выполняется…" : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
