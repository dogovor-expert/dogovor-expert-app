import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Конвертер документов онлайн — PDF, JPG, Word, OCR бесплатно",
  description:
    "Конвертер документов в браузере: объединение и разделение PDF, JPG↔PDF, OCR сканов, подпись PDF. Бесплатно, файлы не покидают устройство.",
  alternates: { canonical: "/converter" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
