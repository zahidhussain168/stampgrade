import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

import "./globals.css";

// Every woff2 lives in the repo rather than being fetched at build time. Same
// self-hosting and zero layout shift as a CDN font, but the build has no
// network dependency — a foundry blip can't fail a deploy. Licences for all
// three families are recorded in app/fonts/LICENSE.txt.
const clash = localFont({
  src: [
    { path: "./fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  // Measured against Clash Display's metrics so the swap doesn't shift layout.
  adjustFontFallback: false,
});

const general = localFont({
  src: [
    { path: "./fonts/GeneralSans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GeneralSans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/GeneralSans-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-general",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  adjustFontFallback: false,
});

const jetbrains = localFont({
  src: [
    { path: "./fonts/JetBrainsMono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/JetBrainsMono-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/JetBrainsMono-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-jetbrains",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

const SITE = "https://stampgrade.com";
const DESCRIPTION =
  "Paste a URL and get one brutal score out of 100 from fifteen deterministic checks, a stamped grade letter, and a share card. Free forever, no signup.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "StampGrade — Your website has a grade. See it free.",
  description: DESCRIPTION,
  applicationName: "StampGrade",
  keywords: [
    "website audit",
    "seo checker",
    "website score",
    "site grader",
    "website scorecard",
    "free seo audit",
  ],
  alternates: { canonical: SITE },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "StampGrade",
    title: "StampGrade — Your website has a grade. See it free.",
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "A StampGrade card scoring 96 out of 100 with a stamped grade A.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StampGrade — Your website has a grade. See it free.",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08090C",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${clash.variable} ${general.variable} ${jetbrains.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {/* Fixed grid + grain behind everything. Purely decorative. */}
        <div className="atmosphere" aria-hidden="true" />
        <div className="relative z-[1]">
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
