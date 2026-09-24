import type { Metadata } from "next";
import { withSeo } from "@/lib/seo/withSeo";

// Клиентская страница хаба (живой поиск) не может экспортировать metadata —
// SEO-мета живёт здесь, в серверном layout сегмента.
export const metadata: Metadata = withSeo({
  path: "/zayavleniya",
  title: "Заявления — образцы и бланки 2026: ФССП, суды, работа, ЖКХ",
  description:
    "120+ заявлений с образцами заполнения и пустыми бланками: приставам, в суды, работодателю, ЖКХ, полицию. Заполнение онлайн за 5 минут, PDF и Word бесплатно.",
  keywords: [
    "заявления образцы",
    "бланки заявлений скачать",
    "заявление приставам образец",
    "жалоба в прокуратуру образец",
    "заявление на отпуск образец",
  ],
  robots: { index: true, follow: true },
  openGraph: { url: "/zayavleniya" },
});

export default function ZayavleniyaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
