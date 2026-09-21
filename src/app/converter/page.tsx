import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Lock, ShieldCheck, Zap, type LucideIcon } from "lucide-react";
import ConverterCatalog from "@/components/converter/ConverterCatalog";
import { withSeo } from "@/lib/seo/withSeo";

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

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ShieldCheck,
    title: "Приватно по умолчанию",
    text: "Файлы обрабатываются прямо в браузере и не отправляются на сервер — важно для документов с персональными данными.",
  },
  {
    icon: Zap,
    title: "Без регистрации",
    text: "Инструменты доступны сразу: не нужно создавать аккаунт и что-то оплачивать.",
  },
  {
    icon: FileText,
    title: "14 инструментов",
    text: "PDF, изображения, Word, OCR, подпись и разметка — всё в одном месте.",
  },
  {
    icon: Lock,
    title: "Документы под контролем",
    text: "Вы сами решаете, что скачать и отправить: файлы остаются на вашем устройстве.",
  },
];

export default function ConverterPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 p-6">
      <header className="space-y-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FileText className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Конвертер документов</h1>
        <p className="max-w-2xl text-gray-600">
          Инструменты для PDF, изображений, Word и распознавания текста. Всё работает в браузере:
          файлы не загружаются на сервер и не покидают ваше устройство.
        </p>
      </header>

      <ConverterCatalog />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Как это работает</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "Выберите инструмент", text: "Откройте нужную страницу из каталога выше." },
            { title: "Добавьте файл", text: "Документ обрабатывается локально в браузере." },
            { title: "Скачайте результат", text: "Сохраните готовый файл на устройство." },
          ].map((step, i) => (
            <li key={step.title} className="rounded-xl border border-gray-200 bg-white p-4">
              <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
                {i + 1}
              </span>
              <p className="font-medium text-gray-900">{step.title}</p>
              <p className="mt-1 text-sm text-gray-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Возможности</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-4">
              <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <f.icon className="h-4 w-4" />
              </span>
              <p className="font-medium text-gray-900">{f.title}</p>
              <p className="mt-1 text-sm text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Нужен готовый документ?</h2>
        <p className="mt-1 text-sm text-gray-600">
          В конструкторе — 369 шаблонов договоров, заявлений и согласий с автоматическим заполнением.
        </p>
        <Link
          href="/builder"
          className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Создать документ
        </Link>
      </section>
    </div>
  );
}
