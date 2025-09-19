import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { SearchProvider } from "@/contexts/search-context"
import { CartUIProvider } from "@/contexts/cart-ui-context"
import { Toaster } from "@/components/ui/toaster"
import Prefetcher from "@/components/prefetcher"
import BottomNavigation from "@/components/bottom-navigation"
import CartDrawerMount from "@/components/cart/cart-drawer-mount"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// SEO helpers
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const verificationOther: Record<string, string | number | (string | number)[]> = {}
if (process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION) {
  verificationOther["msvalidate.01"] = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
}
const verificationMeta: Metadata["verification"] = {
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : {}),
  ...(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
    ? { yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION }
    : {}),
  ...(process.env.NEXT_PUBLIC_YAHOO_SITE_KEY
    ? { yahoo: process.env.NEXT_PUBLIC_YAHOO_SITE_KEY as unknown as string }
    : {}),
  ...(Object.keys(verificationOther).length ? { other: verificationOther } : {}),
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FMOSWEB",
    template: "%s | FMOSWEB",
  },
  description: "Your trusted online shopping destination for quality products",
  keywords: [
    "FMOSWEB",
    "online shop",
    "ecommerce",
    "buy online",
    "best price",
    "electronics",
    "fashion",
    // Bangla keywords for bilingual SEO
    "অনলাইন শপ",
    "ই-কমার্স",
    "কেনাকাটা",
    "বাংলাদেশ",
    "কম দামে",
    "ইলেকট্রনিক্স",
  ],
  openGraph: {
    type: "website",
    url: "/",
    title: "FMOSWEB — Premium E-commerce Platform",
    description: "Your trusted online shopping destination for quality products",
    siteName: "FMOSWEB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FMOSWEB",
      },
    ],
    locale: "en_US",
    alternateLocale: ["bn_BD"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FMOSWEB — Premium E-commerce Platform",
    description: "Your trusted online shopping destination for quality products",
    images: ["/og-image.png"],
    creator: "@fmosweb",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "bn-BD": "/",
    },
  },
  applicationName: "FMOSWEB",
  themeColor: "#f59e0b",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: verificationMeta,
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} min-h-[100dvh] flex flex-col`}>
        <AuthProvider>
          <CartUIProvider>
            <CartProvider>
              <SearchProvider>
              <Suspense fallback={null}>
                <div className="flex-1 flex flex-col">
                  {children}
                </div>
              </Suspense>
              <Toaster />
              <BottomNavigation />
              <CartDrawerMount />
              </SearchProvider>
            </CartProvider>
          </CartUIProvider>
        </AuthProvider>
        {/* Warm critical API caches for faster navigation */}
        <Prefetcher />
        <Analytics />
      </body>
    </html>
  )
}
