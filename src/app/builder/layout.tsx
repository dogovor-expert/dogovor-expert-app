import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Конструктор договоров онлайн",
  description: "Пошаговое заполнение шаблона договора: стороны, предмет, условия. Проверка обязательных полей и реквизитов по требованиям закона, экспорт в PDF и DOCX. Данные не покидают ваш браузер.",
  alternates: { canonical: "/builder" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
