import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";

import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

import "./globals.css";

// next/font downloads and self-hosts these at build time, so there is no
// third-party request at runtime and no layout shift while they load.
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-schibsted",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
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
    <html lang="en" className={`${schibsted.variable} ${jetbrains.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
