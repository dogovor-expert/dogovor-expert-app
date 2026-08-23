import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ОСАГО онлайн — расчёт и оформление полиса",
  description: "Рассчитайте стоимость и оформите полис ОСАГО онлайн у партнёра сервиса: сравнение предложений страховых компаний.",
  alternates: { canonical: "/osago" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
