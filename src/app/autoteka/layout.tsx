import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проверка автомобиля по VIN онлайн",
  description: "Бесплатная проверка истории автомобиля по VIN: участие в ДТП, ограничения ГИБДД, залоги, розыск, число владельцев, данные ОСАГО. Отчёт за 2–5 минут.",
  alternates: { canonical: "/autoteka" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
