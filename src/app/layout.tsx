import type { Metadata } from "next";
import "@/styles/globals.css";
import AppLayout from "@/components/layouts/AppLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { YandexMetrika } from "@/components/analytics/YandexMetrika";
import { YandexMetrikaPageView } from "@/components/analytics/YandexMetrikaPageView";
import { PostHog } from "@/components/analytics/PostHog";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_CONTACT_EMAIL } from "@/lib/site";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import VaultWrapper from "@/components/VaultWrapper";

// Source-based CSP в middleware (без nonce/'strict-dynamic'): политика по
// источникам совместима со статическим prerender (SSG/ISR), который собирается
// без middleware. force-dynamic не используется — публичные страницы остаются
// в CDN-кэше (см. docs/adr/0001-use-supabase).
// Самохостинг шрифтов через next/font: Google Fonts скачиваются при сборке и
// отдаются с нашего домена (без внешнего раунд-трипа в fonts.googleapis.com).
// Inter — основной шрифт сайта (font-sans): прелоадится на каждой странице.
// Playfair_Display и JetBrains_Mono используются только в превью документов
// (A4-листы), поэтому их НЕ прелоадим на страницах логина/дашборда — они
// загрузятся с display:swap, когда реально понадобятся. Это снимает ~2 шрифта
// (≈80KB) с критического пути LCP.
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-playfair", display: "swap", preload: false });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-jetbrains", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | Dogovor.expert`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // alternates.canonical намеренно НЕ задан на уровне root layout —
  // иначе 404-страницы (not-found.tsx) наследуют canonical=/ и Googlebot видит
  // "soft-404" (404 + canonical=/ + noindex). Главная страница задаёт canonical
  // явно в src/app/page.tsx, остальные — в page/layout metadata.
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "Dogovor.expert",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dogovor.expert — конструктор договоров онлайн",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <head>
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Dogovor-Эксперт™",
              alternateName: ["Dogovor.expert", "Договор-Эксперт", "Dogovor-Expert"],
              url: SITE_URL,
              logo: `${SITE_URL}/apple-icon.png`,
              email: SITE_CONTACT_EMAIL,
              description: SITE_DESCRIPTION,
              foundingDate: "2024",
              // E1 (brand protection): sameAs связывает Organization с официальными соцсетями.
              // Проверено живьём: t.me/dogovor_expert существует, vk.com/dogovor_expert — нет.
              sameAs: ["https://t.me/dogovor_expert"],
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              inLanguage: "ru",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_URL}/templates?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            },
            {
              // E1 (rich results): SoftwareApplication — продукт в Google-вёрткалке
              // и расширенных сниппетах бизнес-инструментов.
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Dogovor-Эксперт™",
              url: SITE_URL,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              inLanguage: "ru",
              description: SITE_DESCRIPTION,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "RUB",
              },
            },
          ]}
        />
      </head>
      <body className="font-sans">
        <VaultWrapper>
          <AppLayout>{children}</AppLayout>
        </VaultWrapper>
        <YandexMetrika />
        <YandexMetrikaPageView />
        <PostHog />
      </body>
    </html>
  );
}
