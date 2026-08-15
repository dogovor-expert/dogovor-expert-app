import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Безопасность аккаунта",
  description: "Управление паролем, двухфакторной аутентификацией и активными сеансами аккаунта Dogovor.expert.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
