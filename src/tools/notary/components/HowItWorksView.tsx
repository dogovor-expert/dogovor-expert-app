import { Camera, Fingerprint, Gavel, GitCompareArrows, Lock, ScrollText, ShieldCheck, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Один клик — слепок",
    text: "Кнопка в расширении или закладка сохраняет полный HTML, скриншот и заголовки ответа сервера. Всё складывается в защищённое хранилище на вашем устройстве.",
    tag: "Захват",
  },
  {
    icon: Fingerprint,
    title: "SHA-256 без сети",
    text: "Отпечаток считается через WebCrypto прямо в браузере. Ни один байт документа не уходит на сторонние серверы.",
    tag: "Подпись",
  },
  {
    icon: GitCompareArrows,
    title: "Умный diff",
    text: "При новом заходе Chronoleaf сравнивает свежую версию с ближайшим слепком: удалённое красным, добавленное — зелёным, переписанное — с подсветкой изменённых слов.",
    tag: "Сравнение",
  },
  {
    icon: ScrollText,
    title: "Юридические подсказки",
    text: "Библиотека паттернов распознаёт «цены», «комиссии», «возврат», «подсудность», «автопродление» и предупреждает: «Пункт о возврате залога изменён 3 дня назад».",
    tag: "Разбор",
  },
  {
    icon: Gavel,
    title: "PDF-протокол в спор",
    text: "К каждому слепку прилагается заверенный протокол с датой, отпечатком и цитатой. Прикладывайте в чат поддержки, обращение в Роспотребнадзор или в суд.",
    tag: "Доказательство",
  },
  {
    icon: ShieldCheck,
    title: "Работает даже офлайн",
    text: "Синхронизация опциональна и происходит через end-to-end шифрование по вашему ключу. Отключитесь от сети — Chronoleaf всё равно продолжит собирать хронику.",
    tag: "Безопасность",
  },
];

export const HowItWorksView = () => {
  return (
    <section className="space-y-5">
      <div className="paper-card p-6 sm:p-8">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
              Как это работает
            </div>
            <h2 className="mt-2 text-[26px] font-semibold leading-[1.15] tracking-tight text-[color:var(--color-ink)] sm:text-[30px]">
              Живая машина времени <span className="gold-underline">оферт и правил</span>. У ваших доказательств появилась память.
            </h2>
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
              Сервисы, маркетплейсы и банки тихо меняют условия задним числом. В момент спора вы больше не остаётесь без аргументов: Chronoleaf хранит то, как страница выглядела в день вашей покупки, и показывает, что именно поменялось после.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="chip chip--ink">
                <Lock size={12} strokeWidth={1.9} /> Zero-knowledge
              </span>
              <span className="chip chip--gold">
                <Fingerprint size={12} strokeWidth={1.9} /> SHA-256 подпись
              </span>
              <span className="chip chip--watch">
                <Sparkles size={12} strokeWidth={1.9} /> Юридический разбор
              </span>
            </div>
          </div>
          <div className="rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-5">
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
              Что уже вошло в архив сообщества
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
              <StatBlock value="42 187" label="страниц под контролем" />
              <StatBlock value="9,4 млн" label="слепков за 2 года" />
              <StatBlock value="1 812" label="доказанных изменений в оферте" />
              <StatBlock value="316" label="успешных возвратов и споров" />
            </div>
            <p className="mt-4 text-[11.5px] leading-relaxed text-[color:var(--color-ink-mute)]">
              Цифры — показательные для демо-инсталляции. В коммерческой версии показатели вашего архива приватны и не суммируются с чужими.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article
              key={step.title}
              className="paper-card flex h-full flex-col gap-3 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[color:var(--color-ink)] text-[color:var(--color-gold-soft)]">
                  <Icon size={17} strokeWidth={1.7} />
                </div>
                <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
                  {step.tag}
                </div>
              </div>
              <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)]">{step.title}</h3>
              <p className="text-[12.5px] leading-relaxed text-[color:var(--color-ink-soft)]">{step.text}</p>
            </article>
          );
        })}
      </div>

      <div className="paper-card p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
              Почему это важно
            </div>
            <h3 className="mt-1 text-[18px] font-semibold text-[color:var(--color-ink)]">
              «Мы обновили условия» — больше не аргумент против вас
            </h3>
            <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 severity-dot severity-dot--critical" />
                Когда меняются комиссии и штрафы, у вас в руках версия на момент оплаты.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 severity-dot severity-dot--warning" />
                Мы разбираем не только слова, но и юридические намерения — «автопродление», «безакцептное списание», «медиативная оговорка».
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 severity-dot severity-dot--watch" />
                Diff открывается в один клик: вам не нужно быть юристом, чтобы увидеть подвох.
              </li>
            </ul>
          </div>
          <div className="rounded-[12px] border border-[color:var(--color-line)] bg-[color:var(--color-paper)] p-5">
            <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-mute)]">
              Ответственно
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--color-ink-soft)]">
              Chronoleaf — это персональный архив, а не автоматическое юридическое заключение. Мы помогаем зафиксировать факты и подсвечиваем формулировки, но окончательное толкование делаете вы или ваш юрист.
            </p>
            <p className="mt-3 text-[11.5px] leading-relaxed text-[color:var(--color-ink-mute)]">
              Все сервисы и документы в демо — вымышленные. Совпадения с реальными компаниями случайны и служат только для иллюстрации возможностей.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatBlock = ({ value, label }: { value: string; label: string }) => (
  <div className="rounded-[10px] border border-[color:var(--color-line)] bg-[color:var(--color-paper-raised)] px-3 py-2.5">
    <div className="mono text-[18px] font-medium text-[color:var(--color-ink)]">{value}</div>
    <div className="mono mt-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)]">{label}</div>
  </div>
);
