import { Bot, Calculator, FileStack, MapPinned, ScanText, Signature } from "lucide-react";

interface HomeFeaturesProps {
  totalTemplates: number;
}

const FEATURES = [
  {
    icon: FileStack,
    title: "юридических шаблонов",
    prefix: true,
    desc: "Договоры купли-продажи, аренды, оказания услуг, акты, заявления, жалобы, иски, кадровые формы — с live-предпросмотром.",
    accent: "from-indigo-500 to-blue-600",
  },
  {
    icon: Bot,
    title: "AI-юрист со ссылками на статьи",
    prefix: false,
    desc: "Отвечает по текстам действующих законов с цитатами статей, а не «из головы». Разбор ситуации и готовый документ в 1 клик.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    icon: Signature,
    title: "УКЭП прямо в браузере",
    prefix: false,
    desc: "Подписание через КриптоПро с проверкой цепочки доверия по TSL Минцифры и метками времени TSA.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    icon: Calculator,
    title: "23 правовых калькулятора",
    prefix: false,
    desc: "Госпошлины НК РФ, пени по ст. 395 ГК, отпускные, алименты, ОСАГО и КБМ, растаможка — с актуальными ставками.",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    icon: ScanText,
    title: "OCR и конвертеры",
    prefix: false,
    desc: "Распознавание текста с фото и сканов, 15 инструментов: DOCX ↔ PDF, объединение и разделение PDF, изображения в PDF.",
    accent: "from-amber-500 to-orange-600",
  },
  {
    icon: MapPinned,
    title: "Умное автозаполнение",
    prefix: false,
    desc: "Адреса и реквизиты подтягиваются через DaData, связанные поля заполняются автоматически, черновики сохраняются.",
    accent: "from-sky-500 to-cyan-600",
  },
];

/** Возможности сервиса — 6 карточек. */
export default function HomeFeatures({ totalTemplates }: HomeFeaturesProps) {
  return (
    <section id="features" className="bg-slate-50/60 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Возможности сервиса</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Всё для работы с документами в одном месте
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Мы избавляем от рутины: от подбора формулировок до юридически значимой подписи.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5"
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${f.accent} opacity-0 blur-3xl transition duration-500 group-hover:opacity-10`}
                aria-hidden="true"
              />
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} shadow-lg`}>
                <f.icon className="h-6 w-6 text-white" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">
                {f.prefix ? `${totalTemplates}+ ${f.title}` : f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
