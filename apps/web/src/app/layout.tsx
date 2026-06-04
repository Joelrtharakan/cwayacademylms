import type { Metadata } from "next";
import { Jost, Fraunces, Karla, JetBrains_Mono, Cinzel } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { GlobalReveal } from "@/components/GlobalReveal";
import { Toaster } from "sonner";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${dmSerif.variable} ${inter.variable} ${jetbrainsMono.variable} ${cinzel.variable}`}
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
        <Toaster position="top-right" richColors />
        <GlobalReveal />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
