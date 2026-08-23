import type { Metadata } from "next";
import { TEMPLATE_META } from "@/data/templatesMeta";

export const metadata: Metadata = {
  title: "Каталог шаблонов договоров",
  description: `Готовые шаблоны договоров: ДКП авто и квартиры, аренда, подряд, расписка, счёт. Заполнение онлайн, автопроверка, экспорт в PDF и DOCX.`,
  alternates: { canonical: "/templates" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
