import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ОСАГО онлайн и проверка КБМ",
  description: "Рассчитайте и оформите полис ОСАГО у партнёра онлайн, а также проверьте свой коэффициент бонус-малус (КБМ) по официальному реестру РСА.",
  alternates: { canonical: "/osago" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
