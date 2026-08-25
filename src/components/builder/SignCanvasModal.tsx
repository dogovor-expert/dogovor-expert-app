"use client";
import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface SignCanvasModalProps {
  drawingFor: "seller" | "buyer";
  onClose: () => void;
  onSave: (who: "seller" | "buyer", dataUrl: string) => void;
  isOpen: boolean;
}

export default function SignCanvasModal({
  drawingFor,
  onClose,
  onSave,
  isOpen,
}: SignCanvasModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawPosRef = useRef<{ x: number; y: number } | null>(null);
  const [dirty, setDirty] = useState(false);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    drawPosRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
    canvas.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawPosRef.current) return;
    const canvas = e.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(drawPosRef.current.x, drawPosRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    drawPosRef.current = { x, y };
    setDirty(true);
  };

  const onPointerUp = () => {
    drawPosRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setDirty(false);
  };

  const saveSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(drawingFor, dataUrl);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Нарисуйте подпись"
      size="md"
      showCloseButton
      closeOnOverlayClick
      closeOnEscape
    >
      <p className="text-[11px] text-gray-600 mb-3">
        {drawingFor === "seller" ? "Продавец" : "Покупатель"} — пальцем,
        мышью или стилусом
      </p>
      <canvas
        ref={canvasRef}
        width={500}
        height={160}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="w-full h-40 border border-gray-200 rounded-lg bg-white touch-none cursor-crosshair"
      />
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={clearCanvas}
          disabled={!dirty}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Очистить
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={saveSign}
            disabled={!dirty}
            className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500 transition-colors"
          >
            Сохранить подпись
          </button>
        </div>
      </div>
    </Modal>
  );
}