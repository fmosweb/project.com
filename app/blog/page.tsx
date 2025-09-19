import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { blogPostsBn } from "@/lib/blog/posts-bn"

export const metadata: Metadata = {
  title: "ব্লগ",
  description: "বাংলা ব্লগ — অনলাইন কেনাকাটা, ইলেকট্রনিক্স গাইড, নিরাপত্তা টিপস এবং আরও অনেক কিছু।",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "/blog",
    title: "FMOSWEB ব্লগ",
    description: "বাংলা ব্লগ — অনলাইন কেনাকাটা, ইলেকট্রনিক্স গাইড, নিরাপত্তা টিপস এবং আরও অনেক কিছু।",
  },
  twitter: {
    card: "summary_large_image",
    title: "FMOSWEB ব্লগ",
    description: "বাংলা ব্লগ — অনলাইন কেনাকাটা, ইলেকট্রনিক্স গাইড, নিরাপত্তা টিপস এবং আরও অনেক কিছু।",
  },
}

export default function BlogIndexPage() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "FMOSWEB ব্লগ",
    url: `${site}/blog`,
    inLanguage: "bn-BD",
  }

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: blogPostsBn.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site}/blog/${p.slug}`,
      name: p.title,
    })),
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ব্লগ</h1>
          <p className="text-gray-600 mt-2">অনলাইন কেনাকাটা, ইলেকট্রনিক্স এবং সেফটি টিপস</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {blogPostsBn.map(post => (
            <article key={post.slug} className="border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative bg-gray-50" style={{ paddingBottom: '56.25%' }}>
                  <img
                    src={post.image || "/og-image.png"}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">{post.title}</h2>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{post.excerpt}</p>
                  <div className="text-xs text-gray-500 mt-3">{new Date(post.date).toLocaleDateString('bn-BD')}</div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      </main>
      <Footer />
      <div className="h-16 md:hidden" />
    </div>
  )
}
