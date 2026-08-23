import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Юридические калькуляторы онлайн — госпошлина, проценты 395 ГК, неустойка",
  description:
    "Бесплатные юридические калькуляторы: госпошлина в суд, проценты по ст. 395 ГК РФ, неустойка, алименты, индексация. Актуальные ставки ЦБ РФ.",
  alternates: { canonical: "/utils" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}