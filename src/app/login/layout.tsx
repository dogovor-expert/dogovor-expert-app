import type { Metadata } from "next";
import { withSeo } from "@/lib/seo/withSeo";

export const metadata: Metadata = withSeo({
  path: "/login",
  title: "Вход и регистрация",
  description:
    "Вход или регистрация в личном кабинете Dogovor.expert. Сохранение черновиков договоров, история, синхронизация между устройствами.",
  robots: { index: false, follow: false },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
