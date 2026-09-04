import type { Metadata } from "next";
import { withSeo } from "@/lib/seo/withSeo";

export const metadata: Metadata = withSeo({
  path: "/utils",
  title: "Калькуляторы: госпошлина, 395 ГК, неустойка",
  description:
    "Бесплатные юридические калькуляторы: госпошлина в суд, проценты по ст. 395 ГК РФ, неустойка, алименты, индексация. Актуальные ставки ЦБ РФ.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
