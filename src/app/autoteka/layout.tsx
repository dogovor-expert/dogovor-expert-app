import type { Metadata } from "next";
import { withSeo } from "@/lib/seo/withSeo";

// Переведено на withSeo: добавляет og:url = /autoteka (в root layout
// openGraph.url намеренно убран, иначе страница наследовала og:url главной —
// аудит 28.09.2026) и приводит title/description к общему контракту.
export const metadata: Metadata = withSeo({
  path: "/autoteka",
  title: "Проверка автомобиля по VIN онлайн",
  description:
    "Проверка авто по VIN: ДТП, ограничения ГИБДД, залоги, розыск, владельцы, ОСАГО. Отчёт формируется онлайн за пару минут.",
  robots: { index: true, follow: true },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
