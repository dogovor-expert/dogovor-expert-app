import type { Metadata } from "next";
import { withSeo } from "@/lib/seo/withSeo";

// Переведено на withSeo: добавляет og:url = /osago (в root layout
// openGraph.url намеренно убран, иначе страница наследовала og:url главной —
// аудит 28.09.2026) и приводит title/description к общему контракту.
export const metadata: Metadata = withSeo({
  path: "/osago",
  title: "ОСАГО онлайн — расчёт и оформление полиса",
  description:
    "Рассчитайте стоимость и оформите полис ОСАГО онлайн у партнёра сервиса: сравнение предложений страховых компаний.",
  robots: { index: true, follow: true },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
