"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-red-500 mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Что-то пошло не так</h1>
        <p className="text-sm text-gray-600 mt-2">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу или повторить действие.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center font-medium px-5 py-2.5 text-sm rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
