"use client"

import type { Metadata } from "next"

import { useState, useEffect, useRef } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card-clean"
import ProductCardSimple from "@/components/product-card-simple"
import ProductFilters from "@/components/product-filters"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid, List, Filter } from "lucide-react"
import type { Product } from "@/lib/services/products-client"

// Mock product data for fallback
const mockProducts = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviews: 124,
    image: "/premium-wireless-headphones.png",
    category: "Electronics",
    brand: "AudioTech",
    inStock: true,
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Smart Fitness Watch",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.9,
    reviews: 89,
    image: "/smart-fitness-watch.png",
    category: "Electronics",
    brand: "FitTech",
    inStock: true,
    badge: "New",
  },
  {
    id: "3",
    name: "Portable Bluetooth Speaker",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.7,
    reviews: 156,
    image: "/portable-bluetooth-speaker.jpg",
    category: "Electronics",
    brand: "SoundWave",
    inStock: true,
    badge: "Sale",
  },
  {
    id: "4",
    name: "Wireless Charging Pad",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.6,
    reviews: 78,
    image: "/wireless-charging-pad.png",
    category: "Electronics",
    brand: "ChargeTech",
    inStock: false,
    badge: "Hot",
  },
  {
    id: "5",
    name: "Gaming Mechanical Keyboard",
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.8,
    reviews: 203,
    image: "/gaming-mechanical-keyboard.png",
    category: "Electronics",
    brand: "GameTech",
    inStock: true,
    badge: "Gaming",
  },
  {
    id: "6",
    name: "4K Webcam",
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.5,
    reviews: 67,
    image: "/4k-webcam.png",
    category: "Electronics",
    brand: "VisionTech",
    inStock: true,
    badge: "Professional",
  },
]

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isMobile, setIsMobile] = useState(false)
  const [sortBy, setSortBy] = useState("featured")
  const [showFilters, setShowFilters] = useState(false)
  // Controls desktop sidebar visibility - hidden by default
  const [showSidebarFilters, setShowSidebarFilters] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const cacheUsedRef = useRef(false)
  
  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Warm state from sessionStorage cache to reduce flicker on back navigation
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('products_list_cache') : null
      if (raw) {
        const cache = JSON.parse(raw)
        if (cache && Array.isArray(cache.data) && typeof cache.ts === 'number') {
          const fresh = Date.now() - cache.ts < 300_000 // 5 min TTL
          if (fresh) {
            setProducts(cache.data)
            setFilteredProducts(cache.data)
            setLoading(false)
            cacheUsedRef.current = true
          }
        }
      }
    } catch {}
  }, [])

  // Build ItemList JSON-LD for SEO
  const site = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: filteredProducts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site}/products/${encodeURIComponent(String((p as any).id))}`,
      name: String((p as any).name || 'Product')
    }))
  }

  // Fetch products from our server API to avoid client-side Supabase/env issues
  useEffect(() => {
    const loadProducts = async () => {
      const controller = new AbortController()
      const TIMEOUT_MS = 10000
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
      try {
        // Read nocache flag from URL to force bypass cache when needed
        const noCache = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('nocache') === '1'

        // Warm UI from cache but DO NOT skip network fetch; we will background revalidate
        try {
          if (!noCache) {
            const raw = typeof window !== 'undefined' ? sessionStorage.getItem('products_list_cache') : null
            if (raw) {
              const cache = JSON.parse(raw)
              const fresh = cache && Array.isArray(cache.data) && typeof cache.ts === 'number' && (Date.now() - cache.ts < 300_000)
              if (fresh) {
                // Warm state for instant paint (avoid flicker)
                if (!cacheUsedRef.current) {
                  setProducts(cache.data)
                  setFilteredProducts(cache.data)
                  setLoading(false)
                  cacheUsedRef.current = true
                }
              }
            }
          }
        } catch {}

        // Always fetch from network to revalidate in background
        if (!cacheUsedRef.current) setLoading(products.length === 0)
        const fetchUrl = '/api/products' + (noCache ? '?t=' + Date.now() : '')
        const res = await fetch(fetchUrl, { signal: controller.signal })
        if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`)
        const json = await res.json()
        const list: Product[] = Array.isArray(json.products) ? json.products : []
        const active = list.filter(p => (p as any).is_active !== false)
        // Update state only if changed to reduce flicker
        const sameLength = active.length === products.length
        const changed = !sameLength || active.some((p, i) => String((p as any).id) !== String((products[i] as any)?.id))
        if (changed) {
          setProducts(active)
          setFilteredProducts(active)
        }
        try { sessionStorage.setItem('products_list_cache', JSON.stringify({ data: active, ts: Date.now() })) } catch {}
      } catch (err) {
        console.error("[ProductsPage] Error loading products:", err)
        setError(true)
        // Keep any warmed cache instead of blanking the UI
        if (products.length === 0) {
          setProducts([])
          setFilteredProducts([])
        }
      } finally {
        clearTimeout(timeoutId)
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleFilterChange = (filters: any) => {
    let filtered = products

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) => filters.categories.includes(product.category))
    }

    // Apply brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter((product) => 
        product.brand && filters.brands.includes(product.brand)
      )
    }

    // Apply price range filter
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
      filtered = filtered.filter(
        (product) => product.price >= filters.priceRange.min && product.price <= filters.priceRange.max,
      )
    }

    // Apply availability filter
    if (filters.inStockOnly) {
      filtered = filtered.filter((product) => product.stock > 0)
    }

    setFilteredProducts(filtered)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    const sorted = [...filteredProducts]

    switch (value) {
      case "price-low":
        sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
        break
      case "price-high":
        sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
        break
      case "rating":
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
      case "newest":
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      default:
        // Featured - keep original order
        break
    }

    setFilteredProducts(sorted)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-0.5 sm:mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 uppercase tracking-wide">All Product</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop (animated) */}
          <div
            className={`hidden lg:block flex-shrink-0 overflow-hidden transition-all duration-500 ease-in-out will-change-[width,opacity,transform] transform-gpu ${showSidebarFilters ? 'w-64 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4'}`}
            aria-hidden={!showSidebarFilters}
          >
            <div className={`transition-all duration-500 will-change-[opacity,transform] transform-gpu ${showSidebarFilters ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-2 scale-95'}`}>
              <ProductFilters onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* Main Content */}
          <div className={`flex-1 transition-all duration-500 ease-in-out transform-gpu ${showSidebarFilters ? 'translate-x-0' : 'lg:translate-x-1'}`}>
            {/* Toolbar - Hide on mobile for cleaner look */}
            <div className="hidden sm:block bg-white rounded-lg shadow-sm border p-3 sm:p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowFilters((v) => !v)
                      setShowSidebarFilters((v) => !v)
                    }}
                    aria-expanded={(showFilters || showSidebarFilters)}
                  >
                    <Filter className={`h-4 w-4 mr-2 transition-transform duration-300 ${ (showFilters || showSidebarFilters) ? 'rotate-90' : 'rotate-0'}`} />
                    {(showFilters || showSidebarFilters) ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                  <span className="hidden sm:inline-block text-sm text-gray-600">
                    Showing {filteredProducts.length} of {products.length} products
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-36 sm:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Backdrop Overlay */}
            <div
              onClick={() => setShowFilters(false)}
              className={`lg:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${showFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
              aria-hidden={!showFilters}
            />

            {/* Mobile Filters (animated dropdown) */}
            <div
              className={`lg:hidden mb-6 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform,max-height] transform-gpu relative z-40 ${showFilters ? 'max-h-[700px] opacity-100 translate-y-0 scale-100' : 'max-h-0 opacity-0 -translate-y-2 scale-95'}`}
              aria-hidden={!showFilters}
            >
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <ProductFilters onFilterChange={handleFilterChange} />
              </div>
            </div>

            {/* Products Grid/List or Loading Skeleton */}
            {loading ? (
              <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 ${showSidebarFilters ? 'lg:grid-cols-3 xl:grid-cols-3' : 'lg:grid-cols-4 xl:grid-cols-4'} gap-2 sm:gap-6 transition-all duration-300`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg border bg-white shadow-sm overflow-hidden animate-pulse">
                    {/* Image placeholder */}
                    <div className="w-full h-48 bg-gray-200" />
                    {/* Content placeholder */}
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="flex items-center justify-between mt-4">
                        <div className="h-6 bg-gray-200 rounded w-24" />
                        <div className="h-9 bg-gray-200 rounded w-28" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className={viewMode === "grid" ? `grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 ${showSidebarFilters ? 'lg:grid-cols-3 xl:grid-cols-3' : 'lg:grid-cols-4 xl:grid-cols-4'} gap-2 sm:gap-6 transition-all duration-300` : "space-y-4"}>
                  {filteredProducts.map((product) => (
                    isMobile && viewMode === "grid" ? (
                      <ProductCardSimple key={product.id} product={product} />
                    ) : (
                      <ProductCard key={product.id} product={product} viewMode={viewMode} />
                    )
                  ))}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Grid className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">Try adjusting your filters to see more results.</p>
                  </div>
                )}

                {/* JSON-LD: ItemList for products listing */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <div className="h-16 md:hidden" />
    </div>
  )
}
