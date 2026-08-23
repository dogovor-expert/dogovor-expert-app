import type { Metadata } from "next";
import "@/styles/globals.css";
import AppLayout from "@/components/layouts/AppLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { YandexMetrika } from "@/components/analytics/YandexMetrika";
import { YandexMetrikaPageView } from "@/components/analytics/YandexMetrikaPageView";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_CONTACT_EMAIL } from "@/lib/site";

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
    <html lang="ru">
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
                  urlTemplate: `${SITE_URL}/templates?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            },
          ]}
        />
      </head>
      <body>
        <AppLayout>{children}</AppLayout>
        <YandexMetrika />
        <YandexMetrikaPageView />
      </body>
    </html>
  );
}
