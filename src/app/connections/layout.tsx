import type { Metadata } from "next";

// E3 (аудит): auth-gated страница не должна индексироваться — при заходе
// без сессии происходит редирект на /login, и URL рискует попасть в индекс.
export const metadata: Metadata = {
  title: "Облачные подключения",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
