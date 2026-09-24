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

export default function AiYuristPage() {
  // Suspense обязателен: клиент использует useSearchParams (?topup=success).
  return (
    <Suspense>
      <AiYuristClient />
    </Suspense>
  );
}
