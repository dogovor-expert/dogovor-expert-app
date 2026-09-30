import type { Metadata } from "next";
import { HelpCircle, ChevronRight } from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";
import StickyCta from "@/components/home/StickyCta";
import HomeHero from "@/components/home/HomeHero";
import HomeTrustBar from "@/components/home/HomeTrustBar";
import HomeMarketStrip from "@/components/home/HomeMarketStrip";
import HomeHowItWorks from "@/components/home/HomeHowItWorks";
import HomeFeatures from "@/components/home/HomeFeatures";
import HomeTools from "@/components/home/HomeTools";
import HomeTemplates, { type TemplateCategory } from "@/components/home/HomeTemplates";
import HomeCalculators, { type HomeCalculator } from "@/components/home/HomeCalculators";
import HomeSecurity from "@/components/home/HomeSecurity";
import HomeTestimonials from "@/components/home/HomeTestimonials";
import HomePricing from "@/components/home/HomePricing";
import HomeCta from "@/components/home/HomeCta";
import HomeFooter from "@/components/home/HomeFooter";
import { TEMPLATE_META_LITE } from "@/data/templatesMetaLite";
import { CALCULATOR_TOOLS } from "@/data/calculator-tools";
import { currentProPrice } from "@/lib/pricing";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 3600;
export const dynamic = "force-static"; // P0: явно включаем SSG, иначе Next 15 обходит ISR (см. INVARIANTS.md).

// openGraph задан явно (аудит 28.09.2026): в root layout url намеренно убран,
// чтобы страницы его не наследовали. Главная — единственная, где og:url
// равен корню, поэтому прописываем его здесь вместе с OWN-картинкой/описанием.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — онлайн-конструктор договоров`,
    description: SITE_DESCRIPTION,
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: "Dogovor.expert — конструктор договоров онлайн" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — онлайн-конструктор договоров`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

const TOTAL = TEMPLATE_META_LITE.length;

const CATEGORY_TITLES: Record<string, string> = {
  realty: "Аренда и недвижимость",
  auto: "Авто и транспорт",
  business: "Бизнес и услуги",
  finance: "Финансы",
  family: "Семья и наследство",
  legal: "Суд, иски и жалобы",
  migpost: "Миграция и почта",
  other: "Прочее",
};

const CATEGORY_ORDER = ["realty", "auto", "business", "finance", "family", "legal", "migpost", "other"];

function templateCategories(): TemplateCategory[] {
  const samples = new Map<string, string[]>();
  const counts = new Map<string, number>();
  for (const t of TEMPLATE_META_LITE) {
    const g = t.category === "migration" || t.category === "postal" ? "migpost" : t.category;
    counts.set(g, (counts.get(g) ?? 0) + 1);
    const arr = samples.get(g) ?? [];
    if (arr.length < 3) arr.push(t.name);
    samples.set(g, arr);
  }
  return CATEGORY_ORDER.map((id) => ({
    id,
    title: CATEGORY_TITLES[id] ?? id,
    count: counts.get(id) ?? 0,
    docs: samples.get(id) ?? [],
  }));
}

const SHOWCASE_CALC_SLUGS = [
  "gosposhlina",
  "395-gk",
  "otpusknye",
  "alimenty",
  "transportnyy-nalog",
  "shtrafy-gibdd",
];

function showcaseCalculators(): HomeCalculator[] {
  const out: HomeCalculator[] = [];
  for (const slug of SHOWCASE_CALC_SLUGS) {
    const t = CALCULATOR_TOOLS.find((c) => c.slug === slug);
    if (t) out.push({ slug, label: t.label, short: t.short });
  }
  return out;
}

const FAQ: { q: string; a: string }[] = [
  {
    q: "Это действительно бесплатно?",
    a: "Да. Все шаблоны доступны без оплаты, регистрации и подписки. Скачивание PDF не ограничено — мы не берём деньги за базовые документы.",
  },
  {
    q: "Нужно ли регистрироваться?",
    a: "Нет. Можно заполнить и скачать документ без аккаунта. Регистрация нужна только если вы хотите сохранять черновики и историю документов между устройствами.",
  },
  {
    q: "Куда попадают мои данные?",
    a: "Данные документов обрабатываются прямо в браузере и не отправляются на сервер. Серверные функции (точный OCR, синхронизация) включаются только с вашего отдельного согласия — в соответствии с 152-ФЗ.",
  },
  {
    q: "Документы имеют юридическую силу?",
    a: "Шаблоны составлены по актуальным формулировкам ГК РФ и проверены практикующим юристом. Готовый документ можно подписывать и использовать. Для сложных сделок рекомендуем консультацию юриста.",
  },
  {
    q: "В каком формате я получу документ?",
    a: "На выбор: PDF для печати и подписи — доступен всем; DOCX для дальнейшего редактирования в Word — в подписке PRO. Также доступна отправка на печать прямо из браузера.",
  },
  {
    q: "Можно ли заполнить документ с телефона?",
    a: "Да, сервис полностью адаптивен. Можно сфотографировать паспорт или ПТС — сканер распознает данные и подставит их в поля автоматически.",
  },
];

export default function HomePage() {
  const categories = templateCategories();
  const calculators = showcaseCalculators();
  const proPrice = currentProPrice();

  return (
    <div className="min-h-full bg-white pb-10">
      <HomeHero totalTemplates={TOTAL} />
<HomeTrustBar />
        <HomeMarketStrip />
        <HomeHowItWorks totalTemplates={TOTAL} />
        <HomeFeatures totalTemplates={TOTAL} />
        <HomeTools />
        <HomeTemplates categories={categories} totalTemplates={TOTAL} />
      <HomeCalculators calculators={calculators} />
      <HomeSecurity />
      <HomeTestimonials />
      <HomePricing
        totalTemplates={TOTAL}
        proPrice={proPrice}
        // Раньше здесь передавалась зачёркнутая «старая цена» 990 ₽. Её никогда
        // не списывали, поэтому карточка показывает только реальную цену.
        proOldPrice={null}
      />

      {/* ======================= FAQ ======================= */}
      <section className="mx-auto max-w-3xl px-4 pt-14 sm:px-6 sm:pt-16">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">
            <HelpCircle className="h-3.5 w-3.5" />
            Вопросы и ответы
          </span>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Частые вопросы</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-soft transition-shadow open:shadow-elevated"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-gray-900 marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <HomeCta />

      <AdSlot id="HOME_INFEED" />
      <HomeFooter />
      <StickyCta />
    </div>
  );
}
