import type { Metadata } from "next";

// E3 (аудит): страница согласования по одноразовому токену не должна
// индексироваться — каждый URL уникален и бесполезен для поиска.
export const metadata: Metadata = {
  title: "Согласование договора",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
