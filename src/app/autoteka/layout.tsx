import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проверка автомобиля по VIN онлайн",
  description: "Проверка авто по VIN: ДТП, ограничения ГИБДД, залоги, розыск, владельцы, ОСАГО. Отчёт формируется онлайн за пару минут.",
  alternates: { canonical: "/autoteka" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
