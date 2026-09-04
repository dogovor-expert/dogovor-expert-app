import type { Metadata } from "next";
import { withSeo } from "@/lib/seo/withSeo";

export const revalidate = 3600;
// P0: принудительный SSG вместо динамической генерации. Next 15+ использует ISR
// по умолчанию, force-static даёт предсказуемое поведение и статический HTML-кэш.
export const dynamic = "force-static";

export const metadata: Metadata = withSeo({
  path: "/utils",
  title: "Калькуляторы: госпошлина, 395 ГК, неустойка, НДС",
  description:
    "Бесплатные юридические и финансовые калькуляторы онлайн: расчёт госпошлины по ст. 333.19 НК РФ, процентов по ст. 395 ГК РФ, неустойки по ДДУ, НДС 22%, НДФЛ, алиментов. Актуальные ставки 2026 года, МРОТ, ключевая ставка ЦБ РФ.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
