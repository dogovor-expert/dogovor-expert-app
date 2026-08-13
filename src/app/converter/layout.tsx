import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Конвертер документов онлайн — PDF, JPG, Word, OCR бесплатно",
  description:
    "Объединение и разделение PDF, конвертация JPG в PDF и PDF в JPG, распознавание сканов в текст (OCR), подпись в PDF, конвертация DOCX в PDF. Всё бесплатно и в браузере — файлы не покидают ваше устройство.",
  alternates: { canonical: "/converter" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
