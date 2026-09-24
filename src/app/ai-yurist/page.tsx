import { Suspense } from "react";
import type { Metadata } from "next";
import AiYuristClient from "./AiYuristClient";

export const metadata: Metadata = {
  title: "AI-юрист — ответ по закону за 10 секунд, от 14 ₽",
  description:
    "AI-юрист Dogovor: ответы со ссылками на статьи действующих редакций, разбор договоров, баланс без подписки. Первые 2 вопроса — бесплатно.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/ai-yurist" },
};

// force-dynamic: страница использует useSearchParams (?topup=success) — без
// этого прод отдаёт статически пререндеренный пустой Suspense-fallback,
// и лендинг появляется только после загрузки JS (пустой экран + нет SSR).
export const dynamic = "force-dynamic";

export default function AiYuristPage() {
  // Suspense обязателен: клиент использует useSearchParams (?topup=success).
  return (
    <Suspense>
      <AiYuristClient />
    </Suspense>
  );
}
