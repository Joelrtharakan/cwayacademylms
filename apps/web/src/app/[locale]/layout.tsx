import type { Metadata } from "next";
import { Jost, Fraunces, Karla, JetBrains_Mono, Cinzel, Noto_Sans_Devanagari, Noto_Sans_Tamil, Noto_Sans_Telugu, Noto_Sans_Malayalam, Noto_Sans_Kannada } from "next/font/google";
import "../globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { GlobalReveal } from "@/components/GlobalReveal";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/QueryProvider";
import { ConfirmProvider } from "@/components/shared/ConfirmContext";
import { SessionManager } from "@/components/auth/SessionManager";

/* ── Self-hosted fonts via next/font (no external network requests) ── */
const plusJakarta = Jost({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Karla({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "600", "700", "900"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-noto-hi",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil", "latin"],
  variable: "--font-noto-ta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu", "latin"],
  variable: "--font-noto-te",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam", "latin"],
  variable: "--font-noto-ml",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansKannada = Noto_Sans_Kannada({
  subsets: ["kannada", "latin"],
  variable: "--font-noto-kn",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cwayacademy.org"),
  title: {
    default: "CWAY Academy — Coach, Challenge, and Commission!",
    template: "%s | CWAY Academy",
  },
  description:
    "CWAY Academy equips rural pastors, lay leaders, and Christian disciples through Bible-based theological education and leadership training in local Indian languages. A ministry of CWAY MISSIONS Religious Trust, Bangalore, India.",
  keywords: [
    "Christian leadership training India",
    "Online theological education certificate",
    "Bible training for rural pastors",
    "Indigenous church leadership training",
    "Five-fold ministry courses",
    "Accredited theological training India",
    "CWAY Academy",
    "CWAY Missions",
    "Ministry training India",
    "Theological seminary online",
  ],
  authors: [{ name: "CWAY Academy", url: "https://cwayacademy.org" }],
  creator: "CWAY MISSIONS Religious Trust",
  publisher: "CWAY Academy",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://cwayacademy.org",
    siteName: "CWAY Academy",
    title: "CWAY Academy — Coach, Challenge, and Commission!",
    description:
      "Equipping rural pastors, lay leaders, and Christian disciples through Bible-based theological education and leadership training.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CWAY Academy — Theological Education Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CWAY Academy — Coach, Challenge, and Commission!",
    description:
      "Equipping rural pastors and Christian leaders through premium theological education.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "your-google-verification-code",
  },
};

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  let fontClass = `${plusJakarta.variable} ${dmSerif.variable} ${inter.variable} ${jetbrainsMono.variable} ${cinzel.variable}`;
  let fontStyle: React.CSSProperties = {};

  if (locale === "hi") {
    fontClass += ` ${notoSansDevanagari.variable}`;
    fontStyle = { "--font-sans": "var(--font-noto-hi), sans-serif", "--font-serif": "var(--font-noto-hi), serif" } as React.CSSProperties;
  } else if (locale === "ta") {
    fontClass += ` ${notoSansTamil.variable}`;
    fontStyle = { "--font-sans": "var(--font-noto-ta), sans-serif", "--font-serif": "var(--font-noto-ta), serif" } as React.CSSProperties;
  } else if (locale === "te") {
    fontClass += ` ${notoSansTelugu.variable}`;
    fontStyle = { "--font-sans": "var(--font-noto-te), sans-serif", "--font-serif": "var(--font-noto-te), serif" } as React.CSSProperties;
  } else if (locale === "ml") {
    fontClass += ` ${notoSansMalayalam.variable}`;
    fontStyle = { "--font-sans": "var(--font-noto-ml), sans-serif", "--font-serif": "var(--font-noto-ml), serif" } as React.CSSProperties;
  } else if (locale === "kn") {
    fontClass += ` ${notoSansKannada.variable}`;
    fontStyle = { "--font-sans": "var(--font-noto-kn), sans-serif", "--font-serif": "var(--font-noto-kn), serif" } as React.CSSProperties;
  }

  return (
    <html
      lang={locale}
      className={fontClass}
      style={fontStyle}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "CWAY Academy",
              description:
                "A premier theological training institution equipping rural pastors, lay leaders, and Christian disciples through Bible-based education.",
              url: "https://cwayacademy.org",
              logo: "https://cwayacademy.org/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "admissions",
                email: "admissions@cwayacademy.org",
              },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Bangalore",
                addressRegion: "Karnataka",
                addressCountry: "IN",
              },
              foundingOrganization: {
                "@type": "Organization",
                name: "CWAY MISSIONS Religious Trust",
              },
            }),
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <ConfirmProvider>
              <Toaster position="top-right" richColors />
              <SessionManager />
              <GlobalReveal />
              <SmoothScroll>
                {children}
              </SmoothScroll>
            </ConfirmProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
