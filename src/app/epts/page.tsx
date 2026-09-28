import type { Metadata } from "next";
import { AdSlot } from "@/components/ads/AdSlot";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Clock, FileCheck2, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/faq";
import { SITE_URL } from "@/lib/site";
import { truncateWord, composeTitle } from "@/lib/seo/docMeta";

const TITLE = composeTitle("Выписка из ЭПТС онлайн — электронный документ в PDF за 800 ₽");
const DESCRIPTION = truncateWord(
  "Закажите выписку из электронного паспорта транспортного средства (ЭПТС): официальный электронный документ в PDF. VIN, характеристики ТС, статус паспорта, обременения, утильсбор, таможенные сведения. Онлайн-оплата картой сразу после заявки.",
  160
);

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "выписка ЭПТС",
    "ЭПТС онлайн",
    "электронный паспорт транспортного средства",
    "выписка из ЭПТС заказать",
    "проверить ЭПТС по VIN",
    "ЭПТС PDF",
  ],
  alternates: { canonical: `${SITE_URL}/epts` },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: `${SITE_URL}/epts`,
    siteName: "Dogovor.expert",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Выписка из ЭПТС" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

const EptsOrder = dynamic(() => import("./EptsOrder"), {
  loading: () => (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft" style={{ contain: "layout" }}>
      <div className="h-56 animate-pulse rounded-xl bg-gray-100" />
    </div>
  ),
});

const INCLUDED = [
  { t: "Идентификация ТС", d: "VIN, марка и модель, год выпуска, цвет, категория ТС." },
  { t: "Технические характеристики", d: "Двигатель (марка, тип, объём, мощность), масса, число мест, трансмиссия, топливо." },
  { t: "Статус ЭПТС", d: "Действующий или аннулированный, дата оформления, организация, оформившая паспорт." },
  { t: "Обременения и ограничения", d: "Сведения об обременениях, утилизационном сборе, таможенном оформлении." },
  { t: "Таможенные сведения", d: "Данные о таможенном оформлении для импортированных автомобилей." },
  { t: "Электронная подпись", d: "Документ формируется в PDF и подписан электронной подписью оператора." },
];

const FAQ = [
  {
    q: "Что такое ЭПТС?",
    a: "ЭПТС — электронный паспорт транспортного средства. С 2020 года он хранится в цифровом виде в системе ЭПТС и содержит технические и регистрационные данные автомобиля.",
  },
  {
    q: "Что входит в выписку?",
    a: "Идентификационные и технические данные ТС, статус паспорта, сведения об обременениях, утилизационном сборе и таможенном оформлении. Вы получаете электронный документ в формате PDF.",
  },
  {
    q: "Указываются ли в выписке собственники и ДТП?",
    a: "Нет. В выписке из ЭПТС нет данных о собственниках, ДТП, пробеге и залогах — это сведения других источников. Для истории автомобиля используйте сервисы проверки авто.",
  },
  {
    q: "Как я получу документ?",
    a: "После оплаты оператор оформляет выписку и присылает готовый PDF на указанный email. Ориентировочное время — около 10 минут в рабочее время.",
  },
  {
    q: "Когда нужно оплачивать?",
    a: "Сразу при оформлении заявки. Вы заполняете форму, нажимаете «Оставить заявку и оплатить» и переходите на защищённую страницу ЮKassa для оплаты картой или СБП. После успешной оплаты оператор начинает оформление документа.",
  },
];

export default function EptsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Выписка из ЭПТС", path: "/epts" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Выписка из ЭПТС",
            serviceType: "Выписка из электронного паспорта транспортного средства",
            url: `${SITE_URL}/epts`,
            description: DESCRIPTION,
            provider: { "@type": "Organization", name: "Dogovor.expert", url: SITE_URL },
            offers: { "@type": "Offer", price: "800", priceCurrency: "RUB", availability: "https://schema.org/InStock" },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_460px] lg:items-start">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
            <Clock className="h-3.5 w-3.5" aria-hidden /> Готово примерно за 10 минут
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl">
            Выписка из ЭПТС —{" "}
            <span className="bg-gradient-to-br from-brand-600 to-purple-600 bg-clip-text text-transparent">
              электронный документ в PDF
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
            Официальная выписка из электронного паспорта транспортного средства: VIN, характеристики,
            статус паспорта, обременения и таможенные сведения. Оставляете заявку и оплачиваете
            онлайн — оператор оформляет документ и присылает PDF на email.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {INCLUDED.map((i) => (
              <li key={i.t} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <FileCheck2 className="mb-2 h-5 w-5 text-brand-600" aria-hidden />
                <h2 className="text-sm font-semibold text-gray-900">{i.t}</h2>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{i.d}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:sticky lg:top-24">
          <EptsOrder />
          <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-gray-400" aria-hidden />
            Данные передаются оператору только для оформления выписки.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900">Образец выписки</h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Ниже — реальный образец выписки из ЭПТС. Именно такой документ в формате PDF вы получите.
        </p>
        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
            <span className="text-xs font-medium text-gray-500">выписка-эптс.pdf</span>
            <span className="text-xs font-semibold text-emerald-600">Образец</span>
          </div>
          <Image
            src="/epts-sample-page1.png"
            alt="Образец выписки из ЭПТС — электронный документ в PDF"
            width={862}
            height={1220}
            className="mx-auto h-auto w-full max-w-2xl"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900">Что важно знать про ЭПТС</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          Электронный паспорт транспортного средства заменил бумажный ПТС. Он хранится в цифровом
          виде, а его статус и данные можно проверить по VIN. Выписка из ЭПТС помогает убедиться,
          что паспорт действующий, автомобиль не имеет обременений, а сведения о таможенном
          оформлении и утилизационном сборе корректны.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          Важно: в выписке из ЭПТС <strong>нет</strong> данных о собственниках, ДТП, пробеге и
          залогах — это сведения других источников. Мы честно указываем границы документа, чтобы
          вы понимали, что именно получаете.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-gray-900">Частые вопросы</h2>
        <div className="mt-4 space-y-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-gray-900">{f.q}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{f.a}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Смотрите также: <Link href="/autoteka" className="text-brand-600 hover:underline">проверка авто по VIN</Link> и{" "}
          <Link href="/resume" className="text-brand-600 hover:underline">конструктор резюме</Link>.
        </p>
      </section>
    <AdSlot id="LANDING_INFEED" />
    </div>
  );
}
