"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-900">Критическая ошибка</h1>
          <p className="text-sm text-gray-600 mt-2">
            Приложение столкнулось с ошибкой. Перезагрузите страницу.
          </p>
          <button
            onClick={reset}
            className="mt-6 inline-flex items-center justify-center font-medium px-5 py-2.5 text-sm rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            Перезагрузить
          </button>
        </div>
      </body>
    </html>
  );
}
