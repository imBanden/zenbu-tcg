import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { zenKanji } from "@/lib/fonts";
import { sets } from "@/lib/sets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://zenbutcg.com";
const TITLE =
  "Zenbu TCG — Japanese Pokémon Master Set Lists & Binder Placeholders";
const DESCRIPTION =
  "Free printable binder placeholders and accurate master set lists for every Japanese Pokémon TCG set. Print at 100%, cut, and slot into any 9-pocket binder.";

// themeColor / colorScheme live in `viewport`, not `metadata` (Next 16).
export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Zenbu TCG",
  alternates: { canonical: "/" },
  keywords: [
    "Japanese Pokemon TCG",
    "master set list",
    "binder placeholders",
    "binder inserts",
    "printable",
    "9-pocket binder",
    "Abyss Eye",
    "M5",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Zenbu TCG",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    // og:image is auto-wired by app/opengraph-image.tsx — do not duplicate here.
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    // twitter:image is auto-wired by app/opengraph-image.tsx.
  },
  robots: { index: true, follow: true },
};

// Structured data, built from the same source of truth as the page.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Zenbu TCG",
      description:
        "Free printable binder placeholders and accurate Japanese Pokémon TCG master set lists.",
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#sets`,
      name: "Japanese Pokémon TCG Master Sets",
      itemListElement: sets.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: `${s.name} (${s.code})`,
          datePublished: s.released,
          ...(s.available && s.pdf
            ? {
                associatedMedia: {
                  "@type": "MediaObject",
                  encodingFormat: "application/pdf",
                  contentUrl: `${SITE_URL}${s.pdf}`,
                },
              }
            : {}),
        },
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${zenKanji.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
