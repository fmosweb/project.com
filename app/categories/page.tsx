"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Tag, Loader2 } from "lucide-react"

// Icon mapping for category icons
const iconMapping: Record<string, any> = {
  Tag: Tag,
}

// Import mock categories from data

// Removed mock fallback: rely on database via /api/categories. On failure, show empty list with error.

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Use a ref to track if component is mounted to avoid state updates during render
  const [isClient, setIsClient] = useState(false)
  
  // This effect runs once on mount to indicate we're on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 1) Warm UI from sessionStorage cache (5 min TTL)
      try {
        const raw = typeof window !== 'undefined' ? sessionStorage.getItem('categories_page_cache') : null
        if (raw) {
          const cache = JSON.parse(raw)
          const fresh = cache && Array.isArray(cache.data) && typeof cache.ts === 'number' && (Date.now() - cache.ts < 300_000)
          if (fresh) {
            setCategories(cache.data)
            setIsLoading(false)
          }
        }
      } catch {}

      // 2) Always revalidate from network; bypass CDN if ?nocache=1
      const noCache = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('nocache') === '1'
      const url = '/api/categories' + (noCache ? `?t=${Date.now()}` : '')
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success) {
        console.log("[v1] Categories loaded:", result.categories.length)
        const next = result.categories
        // Reduce UI flicker: only set if different
        const changed = next.length !== categories.length || next.some((c: any, i: number) => String(c.id) !== String((categories[i] || {}).id))
        if (changed) setCategories(next)
        try { sessionStorage.setItem('categories_page_cache', JSON.stringify({ data: next, ts: Date.now() })) } catch {}
      } else {
        console.error("[v1] Error loading categories:", result.error)
        setError("Failed to load categories")
        setCategories([])
      }
    } catch (error) {
      console.error("[v1] Network error:", error)
      setError("Network connection failed")
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  // Normalize Supabase storage paths to absolute URLs when needed
  const normalizeImageUrl = (url?: string | null) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    // Handle Supabase storage public paths like "/storage/v1/object/public/categories/..."
    if (base && (url.startsWith('/storage') || url.startsWith('storage'))) {
      return `${base}${url.startsWith('/') ? '' : '/'}${url}`
    }
    return url
  }

  // Only render the UI after client-side hydration is complete
  // This prevents hydration mismatches by ensuring the client-side rendered content
  // matches what was rendered on the server
  if (!isClient) {
  return (
      <div suppressHydrationWarning className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div suppressHydrationWarning className="animate-pulse flex items-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3 text-balance">
            ক্যাটাগরি থেকে কেনাকাটা করুন
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
            আপনার প্রয়োজনের পণ্য দ্রুত খুঁজে পেতে ক্যাটাগরি অনুযায়ী ব্রাউজ করুন।
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-2">ক্যাটাগরি লোড হচ্ছে...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchCategories} className="bg-amber-600 hover:bg-amber-700">
              আবার চেষ্টা করুন
            </Button>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category) => {
              const IconComponent = iconMapping[category.icon] || Tag;
              return (
                <div key={category.id} className="group/cat rounded-2xl p-[1.5px] bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <Card className="overflow-hidden bg-white rounded-[14px] shadow-sm hover:shadow-md border border-transparent ring-1 ring-amber-200/60 hover:ring-amber-300">
                    <div className="relative h-48 overflow-hidden">
                      <div className="w-full h-full bg-slate-100">
                        {category.image_url && !category.image_url.startsWith('data:') ? (
                          <img
                            src={normalizeImageUrl(category.image_url) || "/placeholder.svg"}
                            alt={category.name}
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <IconComponent className="h-12 w-12 text-slate-400" />
                          </div>
                        )}
                      </div>
                      {/* Overlay gradient */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-70" />
                      {/* Left top icon chip */}
                      <div className={`absolute top-3 left-3 p-2 rounded-md shadow ring-1 ring-white/40 ${category.color || 'bg-gray-500'}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      {/* Right top product count */}
                      <Badge className="absolute top-3 right-3 bg-white/95 text-slate-700 border border-amber-200">
                        {(category.product_count || 0)} টি পণ্য
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-1 line-clamp-1">{category.name}</h3>
                      <p className="text-slate-600 mb-4 text-pretty line-clamp-2 min-h-[2.5rem]">{category.description}</p>
                      <Link href={`/products?category=${category.id}`}>
                        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                          {category.name} ক্যাটাগরির পণ্য দেখুন
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {/* Featured Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">পছন্দের পণ্য খুঁজে পাচ্ছেন না?</h2>
          <p className="text-slate-600 mb-6">সব পণ্য দেখুন বা সার্চ করে দেখুন</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="outline">
                সব পণ্য দেখুন
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg">পণ্য সার্চ করুন</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
