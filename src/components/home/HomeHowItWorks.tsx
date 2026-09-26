import { FileEdit, PenTool, Search, Send } from "lucide-react";

interface HomeHowItWorksProps {
  totalTemplates: number;
}

const STEPS = [
  {
    icon: Search,
    title: "Выберите документ",
    desc: "шаблонов договоров, заявлений, исков и жалоб с готовыми формулировками юристов.",
  },
  {
    icon: FileEdit,
    title: "Заполните конструктором",
    desc: "Отвечайте на вопросы — система сама подставит условия и проверит обязательные поля.",
  },
  {
    icon: PenTool,
    title: "Подпишите УКЭП",
    desc: "Усиленная квалифицированная подпись прямо в браузере через КриптоПро — документ имеет полную юридическую силу.",
  },
  {
    icon: Send,
    title: "Скачайте и отправьте",
    desc: "Экспорт в PDF и DOCX, отправка контрагенту по защищённой ссылке.",
  },
];

/** Как это работает — 4 шага. */
export default function HomeHowItWorks({ totalTemplates }: HomeHowItWorksProps) {
  return (
    <section id="how" className="scroll-mt-4 bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Как это работает</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            От пустого листа до подписанного документа — 4 простых шага
          </h2>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute top-9 hidden h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent lg:block" aria-hidden="true" />
          {STEPS.map((step, idx) => (
            <div key={step.title} className="relative">
              <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <step.icon className="h-7 w-7 text-indigo-600" strokeWidth={1.75} />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-md">
                  {idx + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {idx === 0 ? `${totalTemplates}+ ${step.desc}` : step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
