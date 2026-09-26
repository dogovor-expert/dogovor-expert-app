import type { Metadata } from "next";
import { truncateWord, composeTitle } from "@/lib/seo/docMeta";

export const metadata: Metadata = {
  title: { absolute: composeTitle("Договор купли-продажи авто (ДКП) онлайн") },
  description: truncateWord(
    "Договор купли-продажи автомобиля онлайн за 5 минут: стороны, VIN, цена. Без нотариуса, PDF и DOCX. Шаблон по ст. 454 ГК РФ.",
    160
  ),
  alternates: { canonical: "/dkp" },
  openGraph: {
    title: "Договор купли-продажи автомобиля (ДКП) — бесплатно",
    description:
      "Готовый шаблон ДКП: стороны, паспорта, VIN, цена. Заполните форму — получите документ в PDF.",
    url: "/dkp",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}