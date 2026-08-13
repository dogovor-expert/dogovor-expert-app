import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Юридические калькуляторы онлайн — госпошлина, проценты 395 ГК, неустойка",
  description:
    "Бесплатные юридические калькуляторы: госпошлина в суд (ст. 333.19 НК РФ), проценты по ст. 395 ГК РФ, компенсация за задержку зарплаты (ст. 236 ТК РФ), пени за ЖКХ (ст. 155 ЖК РФ), алименты, договорная неустойка, индексация присуждённых сумм (ст. 208 ГПК РФ). Актуальные ставки ЦБ.",
  alternates: { canonical: "/utils" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}