import type { Metadata } from "next";
import { withSeo } from "@/lib/seo/withSeo";

// title расширен: «Центр помощи» (с брендом — 29 символов) давал слишком
// короткий сниппет (аудит 28.09.2026). og:url задаёт withSeo автоматически —
// в root layout openGraph.url намеренно убран, чтобы страницы его не наследовали.
export const metadata: Metadata = withSeo({
  path: "/help",
  title: "Центр помощи — ответы на вопросы о договорах и документах",
  description:
    "Ответы на вопросы о создании договоров, проверке автомобиля по VIN, расчёте ОСАГО, скидке КБМ и печати документов.",
  robots: { index: true, follow: true },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
