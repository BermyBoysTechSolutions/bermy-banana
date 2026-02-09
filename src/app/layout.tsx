import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/cookie-banner";
import { PersistenceProvider } from "@/hooks/use-persistence";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bermy Banana",
    template: "%s | Bermy Banana",
  },
  description:
    "AI-powered UGC image and video generation. Create stunning influencer photos, talking head videos, and product demos with multi-scene workflows.",
  keywords: [
    "UGC",
    "AI Video",
    "AI Image",
    "Influencer",
    "Product Video",
    "Content Generation",
    "TikTok",
    "Marketing",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Bermy Banana",
    title: "Bermy Banana",
    description:
      "AI-powered UGC image and video generation. Create stunning influencer photos, talking head videos, and product demos.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bermy Banana",
    description:
      "AI-powered UGC image and video generation. Create stunning influencer photos, talking head videos, and product demos.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Bermy Banana",
  description:
    "AI-powered UGC image and video generation. Create stunning influencer photos, talking head videos, and product demos with multi-scene workflows.",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PersistenceProvider>
            <SiteHeader />
            <main id="main-content">{children}</main>
            <SiteFooter />
            <CookieBanner />
            <Toaster richColors position="top-right" />
          </PersistenceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
