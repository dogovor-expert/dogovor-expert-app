import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AiYuristClient from "./AiYuristClient";

export const metadata: Metadata = {
  title: "AI-юрист — ответ по закону за 10 секунд, от 14 ₽",
  description:
    "AI-юрист Dogovor: ответы со ссылками на статьи действующих редакций, разбор договоров, баланс без подписки. Первые 2 вопроса — бесплатно.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/ai-yurist" },
};

// force-dynamic: страница использует useSearchParams (?topup=success) — без
// этого прод отдаёт статически пререндеренный пустой Suspense-fallback,
// и лендинг появляется только после загрузки JS (пустой экран + нет SSR).
export const dynamic = "force-dynamic";

export default async function AiYuristPage() {
  // Признак авторизации считаем на сервере: анонимные посетители (и краулеры)
  // не должны дёргать /api/ai/balance и /api/ai/threads — иначе в консоли
  // появляются 401 на каждый заход. Клиент использует это как стартовое значение.
  let authed = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authed = !!user;
  } catch {
    authed = false;
  }

  // Suspense обязателен: клиент использует useSearchParams (?topup=success).
  return (
    <Suspense>
      <AiYuristClient initialAuthed={authed} />
    </Suspense>
  );
}
