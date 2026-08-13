import type { Metadata } from "next";
import { LEGAL_TEMPLATES } from "@/data/legalTemplates";

export const metadata: Metadata = {
  title: "Каталог шаблонов договоров",
  description: `${LEGAL_TEMPLATES.length} готовых шаблонов юридических документов: договор купли-продажи автомобиля и квартиры, аренды, подряда, расписки, счёт на оплату. Заполнение онлайн, автопроверка полей, экспорт в PDF и DOCX бесплатно.`,
  alternates: { canonical: "/templates" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
