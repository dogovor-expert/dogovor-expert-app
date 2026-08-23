import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Договор купли-продажи автомобиля (ДКП) онлайн — составить и скачать бесплатно",
  description:
    "Договор купли-продажи автомобиля онлайн за 5 минут: стороны, VIN, цена. Без нотариуса, PDF и DOCX. Шаблон по ст. 454 ГК РФ.",
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