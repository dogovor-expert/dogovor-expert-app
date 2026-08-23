import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проверка автомобиля по VIN онлайн",
  description: "Проверка автомобиля по VIN: ДТП, ограничения ГИБДД, залоги, розыск, владельцы, ОСАГО. Бесплатный отчёт за 2–5 минут.",
  alternates: { canonical: "/autoteka" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
