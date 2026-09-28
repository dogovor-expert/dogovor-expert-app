import type { Metadata } from "next";
import { truncateWord, composeTitle } from "@/lib/seo/docMeta";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import AiYuristClient from "./AiYuristClient";
import { AdSlot } from "@/components/ads/AdSlot";

const TITLE = composeTitle("AI-юрист — ответ по закону за 10 секунд, от 14 ₽");
const DESCRIPTION = truncateWord(
  "AI-юрист Dogovor: ответы со ссылками на статьи действующих редакций, разбор договоров, баланс без подписки. Первые 2 вопроса — бесплатно.",
  160
);

// Страница намеренно СТАТИЧЕСКАЯ (SSG + ISR).
//
// Что было не так (аудит 28.09.2026): страница читала cookies Supabase и
// `searchParams` на сервере, поэтому рендерилась динамически. Динамический
// маршрут отдаётся потоком, и при корневом `src/app/loading.tsx` Next сначала
// флашит шелл, а блок metadata приходит позже — description, robots, canonical,
// og:* и twitter:* оказывались в конце <body> (17 meta-тегов вне <head>).
//
// Решение: убрать серверные динамические чтения. `?topup=success` клиент читает
// из `window.location.search` обычным useEffect — без `useSearchParams`, который
// потребовал бы <Suspense> и стриминга. Авторизацию клиент определяет локально по
// cookie (createClient().auth.getSession()), как в AutotekaClient, поэтому анонимы
// и краулеры не получают 401 на /api/ai/*.
//
// НЕ возвращать сюда: `cookies()`, чтение `searchParams`, `force-dynamic`
// и обёртку в `<Suspense>` — любой из них вернёт metadata в <body>.
export const revalidate = 3600;
export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    keywords: [
      "AI-юрист онлайн",
      "юридическая консультация онлайн",
      "задать вопрос юристу",
      "проверить договор онлайн",
      "разбор договора",
    ],
    robots: { index: true, follow: true },
    alternates: { canonical: "/ai-yurist" },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: `${SITE_URL}/ai-yurist`,
      siteName: SITE_NAME,
      title: TITLE,
      description: DESCRIPTION,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AI-юрист Dogovor" }],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: ["/og-image.png"],
    },
  };
}

export default function AiYuristPage() {
  return (
    <>
      <AiYuristClient />
      <div className="mx-auto max-w-3xl px-6 py-10"><AdSlot id="LANDING_INFEED" /></div>
    </>
  );
}
