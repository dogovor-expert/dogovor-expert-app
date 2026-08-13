import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { SITE_CONTACT_EMAIL, SITE_NAME, SITE_LEGAL_INN } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакты",
  description: `Контакты сервиса ${SITE_NAME}: поддержка, сотрудничество, юридический адрес и реквизиты.`,
  alternates: { canonical: "/contacts" },
};

const contactCards = [
  { title: "Поддержка пользователей", desc: "Вопросы по работе сервиса, ошибки, идеи по шаблонам", value: SITE_CONTACT_EMAIL, href: `mailto:${SITE_CONTACT_EMAIL}` },
  { title: "Сотрудничество и партнёрство", desc: "Предложения об интеграциях, обзорах и партнёрских программах", value: SITE_CONTACT_EMAIL, href: `mailto:${SITE_CONTACT_EMAIL}` },
  { title: "Пресс-релизы и СМИ", desc: "Запросы для публикаций о сервисе", value: SITE_CONTACT_EMAIL, href: `mailto:${SITE_CONTACT_EMAIL}` },
];

export default function ContactsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
          <span className="text-2xl">✉️</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Контакты</h1>
          <p className="text-gray-500 text-sm">Мы отвечаем в течение 24 часов в рабочие дни</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {contactCards.map((c) => (
          <Card key={c.title} variant="default" padding="md">
            <h2 className="font-semibold text-gray-900 mb-1">{c.title}</h2>
            <p className="text-xs text-gray-500 mb-3">{c.desc}</p>
            <a href={c.href} className="text-sm font-medium text-brand-600 hover:text-brand-700">
              {c.value}
            </a>
          </Card>
        ))}
      </div>

      <Card variant="default" padding="md" className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Реквизиты</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><span className="text-gray-500">ИНН:</span> {SITE_LEGAL_INN}</p>
        </div>
      </Card>

      <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl text-sm text-gray-600 leading-relaxed">
        <p>Прежде чем писать: проверили ли вы <a href="/help" className="text-brand-600 hover:underline">раздел помощи</a>? Большинство вопросов (печать в PDF, сохранение готовых документов, поиск по каталогу) решаются там.</p>
      </div>
    </div>
  );
}