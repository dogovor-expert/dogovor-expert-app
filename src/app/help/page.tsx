"use client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";
import { Search, ChevronDown, ChevronRight, MessageCircle, Mail, HelpCircle, Star, FileText, Car, Shield, FileCheck, CreditCard } from "lucide-react";
import { tokenGroups, textMatchesTokens } from "@/lib/search";
import { openChat } from "@/components/support/ChatWidget";
import { SUPPORT_EMAIL } from "@/lib/site";
import { AdSlot } from "@/components/ads/AdSlot";

const faqItems = [
  {
    q: "Как создать договор купли-продажи (ДКП)?",
    a: "Перейдите в раздел «Создать документ», выберите шаблон «Договор купли-продажи транспортного средства». Заполните данные продавца, покупателя и автомобиля. Система автоматически проверит VIN и подставит характеристики ТС. После проверки всех полей нажмите «Сформировать» — документ будет готов к скачиванию.",
    category: "ДКП",
  },
  {
    q: "Как проверить историю автомобиля по VIN?",
    a: "В разделе «Проверка авто» введите VIN-номер автомобиля. Система покажет полный отчёт: количество владельцев, участие в ДТП, ограничения ГИБДД, залоги, данные ОСАГО. Проверка доступна на всех тарифах, кроме Базового (для Премиум — 50 проверок/мес).",
    category: "VIN",
  },
  {
    q: "Как рассчитать стоимость ОСАГО?",
    a: "В разделе «ОСАГО» встроен партнёрский калькулятор Inssmart: укажите данные автомобиля, и система сравнит предложения страховых компаний и поможет оформить полис онлайн.",
    category: "ОСАГО",
  },
  {
    q: "Какие документы можно создать в системе?",
    a: "Доступны шаблоны: ДКП на автомобиль/мотоцикл/спецтехнику, доверенность на управление ТС, заявление в ГИБДД о регистрации/снятии с учёта, акт приёма-передачи, договор аренды ТС, извещение о ДТП (европротокол), согласие на обработку персональных данных.",
    category: "Документы",
  },
  {
    q: "Как работает проверка на запреты и ограничения?",
    a: "При проверке VIN система отправляет запрос в базы ГИБДД, ФССП, Федеральной нотариальной палаты. Вы получите информацию о наличии: запретов на регистрационные действия, розыска, залогов, лизинга, утилизации. Отчёт формируется за 2-5 минут.",
    category: "VIN",
  },
  {
    q: "Как отменить или изменить тарифный план?",
    a: "В разделе «Тарифы» вы можете посмотреть условия планов и статус подписки. Смена тарифа станет доступна после подключения оплаты.",
    category: "Оплата",
  },
];

const popularArticles = [
  { title: "Создание ДКП за 5 минут", category: "Документы" },
  { title: "Проверка авто по VIN", category: "VIN" },
  { title: "Расчёт ОСАГО онлайн", category: "ОСАГО" },
  { title: "Экспорт и печать документов", category: "Документы" },
];

const categories = [
  { name: "ДКП", icon: FileText },
  { name: "VIN", icon: Car },
  { name: "ОСАГО", icon: Shield },
  { name: "Документы", icon: FileCheck },
  { name: "Оплата", icon: CreditCard },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggleFaq = (i: number) => {
    setOpenFaq(openFaq === i ? null : i);
  };

  const filteredFaq = faqItems.filter(item => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    const tokens = tokenGroups(search);
    if (tokens.length === 0) return true;
    return textMatchesTokens(`${item.q} ${item.a} ${item.category}`, tokens);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-6 h-6 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Центр помощи</h1>
        <p className="text-gray-600 mb-6">Найдите ответы на ваши вопросы или свяжитесь с поддержкой</p>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
          <input
            type="text" placeholder="Поиск по вопросам и статьям..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 text-base bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-soft"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`px-4 py-2 text-sm rounded-xl font-medium transition-colors ${!categoryFilter ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          Все
        </button>
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => setCategoryFilter(categoryFilter === cat.name ? null : cat.name)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl font-medium transition-colors ${categoryFilter === cat.name ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Часто задаваемые вопросы</h2>
          <div className="space-y-2">
            {filteredFaq.map((item, i) => (
              <Card key={i} variant="default" padding="none" className="overflow-hidden">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{item.q}</span>
                    <Badge variant="blue" size="sm">{item.category}</Badge>
                  </div>
                  {openFaq === i ? (
                    <ChevronDown className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 border-t border-gray-50">
                    <p className="text-sm text-gray-600 leading-relaxed pt-3">{item.a}</p>
                  </div>
                )}
              </Card>
            ))}
            {filteredFaq.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">Ничего не найдено. Попробуйте другой запрос.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-700 fill-amber-500" />
              <h3 className="font-semibold text-gray-900">Популярные статьи</h3>
            </div>
            <div className="space-y-2">
              {popularArticles.map((article, i) => (
                <button
                  key={i}
                  onClick={() => showToast(`Открыть статью: ${article.title}`)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="blue" size="sm">{article.category}</Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card variant="default" padding="md" className="bg-gradient-to-br from-brand-500 to-brand-600 !border-0 text-white">
            <h3 className="font-semibold mb-2">Не нашли ответ?</h3>
            <p className="text-white/80 text-sm mb-4">Мы отвечаем в течение 24 часов в рабочие дни</p>
            <div className="space-y-2">
              <button onClick={() => openChat()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 rounded-xl text-sm hover:bg-white/30 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Чат с поддержкой
              </button>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 rounded-xl text-sm hover:bg-white/30 transition-colors">
                <Mail className="w-4 h-4" />
                Написать на {SUPPORT_EMAIL}
              </a>
            </div>
          </Card>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 pb-10"><AdSlot id="ARTICLE_FOOTER" /></div>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
