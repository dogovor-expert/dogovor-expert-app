import { Star } from "lucide-react";

// ВРЕМЕННО: примеры отзывов из макета — заменить реальными отзывами
// пользователей перед тем, как считать блок достоверным.
const REVIEWS = [
  {
    name: "Анна Ковалёва",
    role: "Собственник, сдаёт квартиры в аренду",
    text: "Составила договор аренды за 10 минут вместо похода к юристу. Понравилось, что система сама подсказывает, какие пункты стоит добавить.",
    initials: "АК",
    color: "from-indigo-500 to-blue-600",
  },
  {
    name: "Дмитрий Соколов",
    role: "Индивидуальный предприниматель",
    text: "Подписываю договоры с подрядчиками УКЭП прямо в браузере — не нужно печатать, сканировать и пересылать бумаги. Экономит часы каждую неделю.",
    initials: "ДС",
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "Марина Гусева",
    role: "HR-специалист, малый бизнес",
    text: "Кадровые шаблоны экономят кучу времени: приказы, трудовые договоры, соглашения — всё в одном месте и всегда актуальное законодательство.",
    initials: "МГ",
    color: "from-amber-500 to-orange-600",
  },
  {
    name: "Игорь Панов",
    role: "Автовладелец",
    text: "Проверил штрафы и разобрался с документами на авто перед сделкой — всё в одном месте, без поездок по инстанциям.",
    initials: "ИП",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Ольга Тимофеева",
    role: "Юрист компании",
    text: "Использую сервис как быструю базу шаблонов для типовых задач — сильно ускоряет рутину, а конструктор условий закрывает нестандартные случаи.",
    initials: "ОТ",
    color: "from-sky-500 to-cyan-600",
  },
  {
    name: "Сергей Ветров",
    role: "Владелец интернет-магазина",
    text: "Составил договор оферты и политику конфиденциальности за один вечер. OCR помог быстро распознать старые сканы документов поставщика.",
    initials: "СВ",
    color: "from-rose-500 to-red-600",
  },
];

/** Отзывы пользователей. */
export default function HomeTestimonials() {
  return (
    <section aria-label="Отзывы пользователей" className="bg-slate-50/60 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Отзывы пользователей</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Нам доверяют люди и предприниматели
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <div key={r.name} className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex gap-0.5" role="img" aria-label="Оценка 5 из 5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">“{r.text}”</p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${r.color} text-sm font-bold text-white`}
                >
                  {r.initials}
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
