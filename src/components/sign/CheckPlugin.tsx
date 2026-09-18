"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Download, RefreshCw } from "lucide-react";
import type { CadesPlugin } from "@/lib/signCryptoPro";

interface CheckPluginProps {
  onReady?: (plugin: CadesPlugin) => void;
  children?: React.ReactNode;
}

export function CheckPlugin({ onReady, children }: CheckPluginProps) {
  const [status, setStatus] = useState<"checking" | "ok" | "missing" | "error">("checking");
  const [, setPlugin] = useState<CadesPlugin | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    let mounted = true;

    async function check() {
      try {
        if (typeof window === "undefined") {
          if (mounted) setStatus("missing");
          return;
        }

        // Попытка загрузить плагин через глобальную переменную (cadesplugin_api.js)
        if (window.cadesplugin) {
          try {
            const loaded = await window.cadesplugin;
            if (mounted && !abortController.signal.aborted) {
              setPlugin(loaded);
              setStatus("ok");
              onReady?.(loaded);
            }
            return;
          } catch {
            // ignore, fall through to missing
          }
        }

        // Плагин не найден в window — проверяем, не загружен ли скрипт уже
        const existingScript = document.querySelector<HTMLScriptElement>('script[src*="cadesplugin"]');
        if (existingScript) {
          // Скрипт есть, ждём загрузки
          let attempts = 0;
          while (attempts < 50 && !window.cadesplugin && !abortController.signal.aborted) {
            await new Promise((r) => setTimeout(r, 100));
            attempts++;
          }
          if (window.cadesplugin && !abortController.signal.aborted) {
            try {
              const loaded = await window.cadesplugin;
              if (mounted) {
                setPlugin(loaded);
                setStatus("ok");
                onReady?.(loaded);
              }
              return;
            } catch {
              // fall through
            }
          }
        }

        if (mounted && !abortController.signal.aborted) setStatus("missing");
      } catch {
        if (mounted && !abortController.signal.aborted) setStatus("error");
      }
    }

    void check();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [onReady]);

  const handleInstall = () => {
    window.open("https://cryptopro.ru/products/cades-plugin", "_blank", "noopener,noreferrer");
  };

  const handleRetry = () => {
    // Полная перезагрузка страницы после установки плагина
    window.location.reload();
  };

  if (status === "checking") {
    return (
      <div role="status" aria-live="polite" className="flex items-center gap-3 p-4">
        <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" aria-hidden="true" />
        <span className="text-sm text-gray-600">Проверка КриптоПро Browser Plugin…</span>
      </div>
    );
  }

  if (status === "ok") {
    return children ?? (
      <div className="flex items-center gap-2 text-sm text-green-700" role="status">
        <CheckCircle className="w-4 h-4" aria-hidden="true" />
        <span>КриптоПро Browser Plugin загружен</span>
      </div>
    );
  }

  return (
    <div role="alert" className="border border-amber-300 bg-amber-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-amber-900">
            Для подписания документов требуется КриптоПро Browser Plugin
          </h3>
          <p className="mt-1 text-sm text-amber-800">
            Плагин обеспечивает работу с вашей электронной подписью в браузере.
            Закрытый ключ <strong>не покидает ваш компьютер</strong>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Скачать плагин
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Я установил, обновить
            </button>
          </div>
          <p className="mt-3 text-xs text-amber-700">
            После установки плагина <strong>обновите эту страницу</strong> (кнопка выше или F5).
            Поддерживаются Chrome, Firefox, Edge, Яндекс.Браузер (через расширение).
          </p>
        </div>
      </div>
    </div>
  );
}