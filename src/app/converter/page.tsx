import type { Metadata } from "next";
import Link from "next/link";
import ConverterHub from "@/components/converter/ConverterHub";
import { withSeo } from "@/lib/seo/withSeo";
import { CONVERTER_TOOLS } from "@/data/converter-tools";

export const metadata: Metadata = withSeo({
  path: "/converter",
  title: "Конвертер документов онлайн — PDF, JPG, Word, OCR бесплатно",
  description:
    "14 инструментов для работы с документами: объединить и сжать PDF, конвертировать JPG/Word, распознать текст (OCR), подписать УКЭП. Файлы обрабатываются в браузере и не загружаются на сервер.",
  keywords: [
    "конвертер pdf",
    "объединить pdf",
    "сжать pdf",
    "pdf в word",
    "jpg в pdf",
    "распознать текст",
    "ocr онлайн",
  ],
});

export default function ConverterPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <ConverterHub />

      <section className="mx-6 mb-10 border-t border-gray-200 pt-6">
        <h2 className="text-sm font-semibold text-gray-500">Все инструменты</h2>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {CONVERTER_TOOLS.map((t) => (
            <li key={t.slug}>
              <Link href={`/converter/${t.slug}`} className="text-brand-600 hover:text-brand-700 hover:underline">
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}