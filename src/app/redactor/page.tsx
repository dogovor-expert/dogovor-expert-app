import type { Metadata } from "next";
import { withSeo } from "@/lib/seo/withSeo";
import RedactorClient from "./redactor-client";

/**
 * Smart Redactor — обезличивание документов прямо в браузере.
 *
 * Отдельный продукт внутри dogovor.expert (раздел «Дополнительные
 * инструменты»). Работает целиком на устройстве: ни один файл не
 * отправляется на сервер, обработка идёт в браузере.
 */
export const metadata: Metadata = withSeo({
  path: "/redactor",
  title: "Обезличивание документов онлайн — скрыть личные данные в PDF бесплатно",
  description:
    "Smart Redactor: автоматически находит и закрывает ФИО, паспорт, ИНН, СНИЛС, БИК, расчётные счета, телефоны и адреса в PDF и изображениях. Всё обрабатывается в вашем браузере — файлы не отправляются на сервер.",
  keywords: [
    "обезличивание документов",
    "закрасить личные данные в pdf",
    "редактировать pdf онлайн",
    "скрыть персональные данные",
    "анонимизация документа",
    "замазать инн паспорт в pdf",
    "удалить данные из pdf",
    "обезличить справку",
  ],
  robots: { index: true, follow: true },
});

export default function RedactorPage() {
  return <RedactorClient />;
}
