import type { Metadata } from "next"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import MobileMiniCategories from "@/components/mobile-mini-categories"
import FeaturedProducts from "@/components/featured-products"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Home",
  description: "Shop premium products online. আপনার পছন্দের প্রিমিয়াম পণ্য কিনুন সহজে এবং নিরাপদে।",
  openGraph: {
    title: "FMOSWEB — Shop premium products online",
    description: "আপনার পছন্দের প্রিমিয়াম পণ্য কিনুন সহজে এবং নিরাপদে",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden">
        <HeroSection />
        <MobileMiniCategories />
        <FeaturedProducts />
        {/* JSON-LD: WebSite + Organization + Breadcrumbs */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "FMOSWEB",
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              potentialAction: {
                "@type": "SearchAction",
                target: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/products?query={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "FMOSWEB",
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/og-image.png`,
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" },
                { "@type": "ListItem", position: 2, name: "Products", item: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/products` },
              ],
            }),
          }}
        />
      </main>
      <Footer />
      <div className="h-16 md:hidden" />
    </div>
  )
}
