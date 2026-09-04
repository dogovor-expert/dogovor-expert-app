import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Страница не найдена — 404",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  // alternates.canonical намеренно НЕ задан — иначе 404 покажет canonical на root,
  // и Googlebot прочитает это как "soft 404" (404 + canonical=/ + noindex).
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-amber-700">404</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Страница не найдена</h1>
        <p className="text-gray-600 mb-6">Запрашиваемая страница не существует или была перемещена</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-medium">
          На главную
        </Link>
      </div>
    </div>
  );
}
