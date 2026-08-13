import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Калькулятор ОСАГО онлайн",
  description: "Рассчитайте стоимость полиса ОСАГО с учётом КБМ, возраста и стажа водителей, региона и мощности двигателя. Сравните предложения страховых компаний.",
  alternates: { canonical: "/osago" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
