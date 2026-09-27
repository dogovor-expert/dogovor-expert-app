import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SITE_NAME } from "@/lib/site";
import { AdSlot } from "@/components/ads/AdSlot";

export const revalidate = 3600;
export const dynamic = "force-static"; // P0: явно включаем SSG, иначе Next 15 обходит ISR (см. INVARIANTS.md).

export const metadata: Metadata = {
  title: "О сервисе",
  description: `${SITE_NAME} — конструктор договоров в браузере: как устроен сервис, принципы приватности, планы развития.`,
  alternates: { canonical: "/about" },
};

const principles = [
  { icon: "🔒", title: "Данные в вашем браузере", desc: "Документы и черновики не покидают ваше устройство. Сервер не видит содержимое договоров — работает принцип privacy by design." },
  { icon: "⚡️", title: "Мгновенное заполнение", desc: "Автоподстановка по ИНН: реквизиты контрагента подтягиваются автоматически — без ручного ввода." },
  { icon: "🖨", title: "PDF за один клик", desc: "Готовый документ печатается и экспортируется в PDF прямо в браузере — без регистрации и плагинов." },
  { icon: "🔄", title: "Всегда актуальные шаблоны", desc: "Базовые шаблоны составлены по действующему гражданскому законодательству РФ и обновляются." },
];

export default function AboutPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
          <span className="text-2xl">🚀</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">О сервисе</h1>
          <p className="text-gray-600 text-sm">Простой путь от идеи до готового документа</p>
        </div>
      </div>
      <div className="mb-8">
        <Badge variant="green" size="sm" dot>{SITE_NAME}</Badge>
      </div>

      <Card variant="default" padding="md" className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Что это</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Бесплатный онлайн-конструктор документов: выбираете шаблон, заполняете форму —
          получаете готовый документ: договор купли-продажи, аренды, подряда, расписку, счёт. Без регистрации,
          без установки и — что главное — без передачи данных на сервер.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {principles.map((p) => (
          <Card key={p.title} variant="default" padding="md">
            <div className="text-2xl mb-2">{p.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
          </Card>
        ))}
      </div>

      <Card variant="default" padding="md" className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Рекомендация по юридической проверке</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-2">
          Шаблоны предоставляются «как есть» и носят информационный характер (см. <a href="/terms" className="text-brand-600 hover:underline">Пользовательское соглашение</a>).
          Перед крупной сделкой рекомендуем получить консультацию квалифицированного юриста.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          С вопросами и предложениями шаблонов пишите на странице <a href="/contacts" className="text-brand-600 hover:underline">«Контакты»</a>.
        </p>
      </Card>
      <div className="mx-auto max-w-3xl px-6 pb-10"><AdSlot id="ARTICLE_FOOTER" /></div>
    </div>
  );
}