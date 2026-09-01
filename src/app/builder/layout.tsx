import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Конструктор договоров онлайн",
  description: "Конструктор договоров: заполнение онлайн, проверка обязательных полей, экспорт в PDF и DOCX. Данные обрабатываются в браузере.",
  alternates: { canonical: "/builder" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
