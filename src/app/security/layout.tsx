import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Безопасность данных",
  description: "Как Dogovor.fun обеспечивает защиту персональных данных: обработка в браузере, шифрование, принципы privacy by design.",
  alternates: { canonical: "/security" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
