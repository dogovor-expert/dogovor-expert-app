import dynamic from "next/dynamic";
import { AdSlot } from "@/components/ads/AdSlot";
import { ShieldCheck, FileSearch, Clock } from "lucide-react";

// E4 (аудит): страница была целиком 'use client' (775 строк) — поисковики
// получали пустой HTML. Теперь H1/интро/FAQ рендерятся на сервере, а
// интерактивный виджет проверки VIN остаётся клиентским островом.
const AutotekaClient = dynamic(() => import("./AutotekaClient"), {
  loading: () => (
    <div className="max-w-3xl mx-auto p-6">
      {/* Точечный скелетон первого экрана (форма ввода VIN): резерв высоты
          только под видимую часть, чтобы избежать обратного CLS после гидратации.
          contain:layout изолирует сдвиги внутри острова. */}
      <div
        className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 min-h-[380px] flex items-center justify-center"
        style={{ contain: "layout" }}
      >
        <div className="h-12 w-2/3 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    </div>
  ),
});

const PERKS = [
  {
    icon: FileSearch,
    title: "ГИБДД, ДТП, розыск, залоги",
    text: "История регистраций, аварии, угоны и банковские обременения — в одном отчёте.",
  },
  {
    icon: ShieldCheck,
    title: "Официальные источники",
    text: "Данные ГИБДД, реестров залогов и VIN-декодирование по стандартам производителя.",
  },
  {
    icon: Clock,
    title: "Отчёт за пару минут",
    text: "Введите VIN — отчёт формируется онлайн и остаётся в личном кабинете навсегда.",
  },
];

export default function AutotekaPage() {
  return (
    <div>
      {/* Резерв высоты под клиентский остров, чтобы предотвратить CLS секции ниже
          (per Lighthouse prod: было 0.358). contain:layout изолирует сдвиги внутри острова. */}
      <div style={{ minHeight: "520px", contain: "layout" }}>
        <AutotekaClient />
      </div>

      <section className="max-w-3xl mx-auto px-6 pb-10 space-y-6 text-gray-700 leading-relaxed">
        <h2 className="text-xl font-bold text-gray-900 sr-only">Проверка автомобиля по VIN</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PERKS.map((p) => (
            <div key={p.title} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p.icon className="h-5 w-5 text-brand-600 mb-2" aria-hidden />
              <h3 className="font-semibold text-gray-900 text-sm">{p.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{p.text}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-900">Зачем проверять автомобиль перед покупкой</h2>
        <p>
          Покупка подержанного автомобиля с рук — всегда риск. Машина может числиться в
          розыске, быть заложена в банке, иметь скрытые ДТП или перебитый VIN. Отчёт по
          VIN-коду показывает юридическую и техническую историю до того, как вы передадите
          деньги: количество владельцев, записи о ДТП и страховых выплатах, работа в такси,
          скрученный пробег, ограничения ГИБДД и залоги.
        </p>

        <h2 className="text-xl font-bold text-gray-900">Частые вопросы</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900">Где взять VIN автомобиля?</h3>
            <p>
              VIN указан в свидетельстве о регистрации (СТС) и ПТС, а также на кузове
              автомобиля — под лобовым стеклом или на стойке водительской двери.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Чем стандартный отчёт отличается от премиум?</h3>
            <p>
              Стандартный отчёт включает базовые проверки ГИБДД и залоги. Премиум
              дополняет расширенной историей ДТП с фото и детализацией страховых случаев.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Отчёт сохраняется?</h3>
            <p>
              Да, все купленные отчёты доступны в разделе истории в личном кабинете —
              можно вернуться к ним в любое время.
            </p>
          </div>
        </div>
      </section>
    <AdSlot id="LANDING_INFEED" />
    </div>
  );
}
