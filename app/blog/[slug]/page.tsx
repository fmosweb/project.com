import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { blogPostsBn } from "@/lib/blog/posts-bn"

export async function generateStaticParams() {
  return blogPostsBn.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = blogPostsBn.find(p => p.slug === params.slug)
  if (!post) return { title: "ব্লগ" }
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      images: post.image ? [{ url: post.image, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : undefined,
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPostsBn.find(p => p.slug === params.slug)
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900">পোস্ট পাওয়া যায়নি</h1>
          <p className="text-gray-600 mt-2">আপনি যে ব্লগটি খুঁজছেন তা মুছে ফেলা হতে পারে।</p>
        </main>
        <Footer />
        <div className="h-16 md:hidden" />
      </div>
    )
  }

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image ? [post.image] : undefined,
    author: post.author ? { "@type": "Person", name: post.author } : { "@type": "Organization", name: "FMOSWEB" },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site}/blog/${post.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: "FMOSWEB",
      logo: {
        "@type": "ImageObject",
        url: `${site}/og-image.png`,
      },
    },
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article>
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{post.title}</h1>
            <div className="text-sm text-gray-500 mt-2">{new Date(post.date).toLocaleDateString('bn-BD')} {post.author ? `• ${post.author}` : ''}</div>
            {post.image && (
              <div className="mt-4 rounded-xl overflow-hidden border">
                <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
              </div>
            )}
          </header>

          <div className="prose prose-sm sm:prose lg:prose-lg max-w-none prose-img:rounded-xl" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      </main>
      <Footer />
      <div className="h-16 md:hidden" />
    </div>
  )
}
