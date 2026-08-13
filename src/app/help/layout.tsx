import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Центр помощи",
  description: "Ответы на вопросы о создании договоров, проверке автомобиля по VIN, расчёте ОСАГО, экспорте и печати документов.",
  alternates: { canonical: "/help" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
