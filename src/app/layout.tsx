import type { Metadata } from "next";
import "@/styles/globals.css";
import AppLayout from "@/components/layouts/AppLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { Canonical } from "@/components/seo/Canonical";
import { YandexMetrika } from "@/components/analytics/YandexMetrika";
import { YandexMetrikaPageView } from "@/components/analytics/YandexMetrikaPageView";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_CONTACT_EMAIL } from "@/lib/site";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import VaultWrapper from "@/components/VaultWrapper";

// Самохостинг шрифтов через next/font: Google Fonts скачиваются при сборке и
// отдаются с нашего домена (без внешнего раунд-трипа в fonts.googleapis.com).
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-playfair", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-jetbrains", display: "swap" });

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
  openGraph: {
    type: "website",
    locale: "ru_RU",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <head>
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Dogovor.expert",
              url: SITE_URL,
              logo: `${SITE_URL}/apple-icon.png`,
              email: SITE_CONTACT_EMAIL,
              description: SITE_DESCRIPTION,
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
          ]}
        />
        <Canonical />
      </head>
      <body className="font-sans">
        <VaultWrapper>
          <AppLayout>{children}</AppLayout>
        </VaultWrapper>
        <YandexMetrika />
        <YandexMetrikaPageView />
      </body>
    </html>
  );
}
