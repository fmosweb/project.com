"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, ShieldCheck, Truck, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useCartUI } from "@/contexts/cart-ui-context"
import { useEffect, useState, useRef } from "react"
// Fetch from our server API to avoid client-side Supabase/env issues

// Fallback mock data removed (no longer used)

type UIProduct = {
  id: string
  name: string
  price: number
  original_price?: number
  images?: string[]
  image_url?: string
  badge?: string
  stock?: number
  is_active?: boolean
  is_featured?: boolean
  category?: string
  brand?: string
  rating?: number
  reviews?: number
  created_at?: string
}


export default function FeaturedProducts() {
  const router = useRouter()
  const { addToCart } = useCart()
  const { openCart } = useCartUI()
  const [products, setProducts] = useState<UIProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const cacheUsedRef = useRef(false)

  // Warm state from sessionStorage cache to avoid flicker on back navigation
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('fp_cache') : null
      if (raw) {
        const cache = JSON.parse(raw)
        if (cache && Array.isArray(cache.data) && typeof cache.ts === 'number') {
          const fresh = Date.now() - cache.ts < 300_000 // 5 min TTL
          if (fresh) {
            setProducts(cache.data)
            setLoading(false)
            cacheUsedRef.current = true
          }
        }
      }
    } catch {}
  }, [])


  useEffect(() => {
    const loadAllProducts = async () => {
      const MAX_ATTEMPTS = 2
      const TIMEOUT_MS = 10000
      let attempt = 0
      // Read nocache flag from URL to force bypass cache when needed
      const noCache = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('nocache') === '1'
      while (attempt < MAX_ATTEMPTS) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
        try {
          // Warm from cache but DO NOT skip network fetch; background revalidate
          try {
            if (!noCache) {
              const raw = typeof window !== 'undefined' ? sessionStorage.getItem('fp_cache') : null
              if (raw) {
                const cache = JSON.parse(raw)
                const fresh = cache && Array.isArray(cache.data) && typeof cache.ts === 'number' && (Date.now() - cache.ts < 300_000)
                if (fresh && !cacheUsedRef.current) {
                  setProducts(cache.data)
                  setLoading(false)
                  cacheUsedRef.current = true
                }
              }
            }
          } catch {}

          setLoading(products.length === 0)
          // Query only what we need: featured first, fallback to active, and limit server-side
          const baseUrl = '/api/products?featured=1&limit=5&fallback=active'
          const fetchUrl = baseUrl + (noCache ? `&t=${Date.now()}` : '')
          const res = await fetch(fetchUrl, { signal: controller.signal })
          if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`)
          const json = await res.json()
          const list: UIProduct[] = Array.isArray(json.products) ? json.products : []
          // Server already applied featured and limit with optional active fallback
          const selected = list.slice(0, 5)
          setProducts(selected)
          try { sessionStorage.setItem('fp_cache', JSON.stringify({ data: selected, ts: Date.now() })) } catch {}
          // After successful refresh, exit the retry loop
          return
        } catch (err) {
          console.error(`[FeaturedProducts] Attempt ${attempt + 1} failed:`, err)
          attempt += 1
          if (attempt >= MAX_ATTEMPTS) {
            setError(true)
            setProducts([])
          } else {
            // small backoff before retry
            await new Promise(r => setTimeout(r, attempt * 600))
          }
        } finally {
          clearTimeout(timeoutId)
          setLoading(false)
        }
      }
    }

    loadAllProducts()
  }, [])

  // Track viewport to tailor mobile vs desktop counts
  useEffect(() => {
    const handleResize = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  const handleAddToCart = (product: UIProduct) => {
    console.log("[v0] Adding product to cart:", product)
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price ?? product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : (product.image_url || "/placeholder.svg"),
    })
    console.log("[v0] Product added to cart successfully")
    try {
      // Immediately open cart drawer on mobile for better UX
      if (isMobile) openCart()
    } catch {}
  }

  const getGridClasses = (count: number) => {
    if (count >= 5) return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 items-stretch"
    if (count === 4) return "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 items-stretch"
    if (count === 3) return "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 items-stretch"
    if (count === 2) return "grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4 items-stretch"
    return "grid grid-cols-1 gap-2 sm:gap-4 items-stretch max-w-sm mx-auto"
  }

  // Only 4 items on mobile, keep full list otherwise (already capped to 5 in fetch)
  const visibleProducts = isMobile ? products.slice(0, 4) : products

  return (
    <section className="pt-1 sm:pt-2 pb-8 mt-3 bg-white top-product-section bg-gradient-to-b from-amber-50/30 via-transparent to-amber-50/30 relative z-0 overflow-hidden">
      {/* Decorative background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 -left-10 h-40 w-40 sm:h-56 sm:w-56 bg-amber-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-10 h-56 w-56 sm:h-72 sm:w-72 bg-orange-300/20 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-3 sm:mb-6">
          <div className="top-product-halo mx-auto mb-0" aria-hidden="true" />
          <div className="mx-auto mb-0 h-4 w-64 rounded-full bg-gradient-to-r from-amber-400/20 via-amber-500/35 to-amber-400/20 blur-md animate-pulse" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 text-balance top-product-title font-serif bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 bg-clip-text drop-shadow-sm">TOP PRODUCT</h2>
          <div className="h-2 w-32 rounded-full mx-auto top-product-underline mb-4 bg-amber-500/70 animate-pulse" />
          <p className="hidden sm:block text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
            Explore our complete collection of premium products designed to meet your needs
          </p>
          {/* Trust badges row */}
          <div className="mt-3 hidden sm:flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-600" />
              <span>Fast Delivery</span>
            </div>
            <span className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Secure Payment</span>
            </div>
            <span className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span>Easy Returns</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className={getGridClasses(visibleProducts.length)}>
            {visibleProducts.map((product) => (
            <Card key={product.id} className="group rounded-lg border border-gray-200 hover:border-gray-300 hover:ring-1 hover:ring-gray-300/50 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col bg-white overflow-hidden">
              <CardContent className="p-0 flex flex-col h-full overflow-hidden">
                <div 
                  className="relative overflow-hidden rounded-t-lg w-full aspect-[16/10] sm:aspect-[16/11] bg-gray-50 flex items-center justify-center"
                  onClick={() => {
                    console.log("Navigating to product:", product.id, product.name);
                    router.push(`/products/${product.id}`);
                  }}
                >
                  <img
                    src={(product.images && product.images.length > 0 ? product.images[0] : (product as any).image_url) || "/placeholder.svg"}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Badge - Product */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                      {product.badge || "New"}
                    </span>
                  </div>

                  {/* Wishlist removed as requested */}
                </div>

                <div 
                  className="px-3 py-1 sm:px-4 sm:py-3.5 flex flex-col flex-1 min-h-[128px] sm:min-h-[180px] overflow-hidden"
                  onClick={() => {
                    console.log("Navigating to product from title:", product.id, product.name);
                    router.push(`/products/${product.id}`);
                  }}
                >
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-balance hover:text-amber-600 transition-colors text-sm sm:text-base leading-snug min-h-[36px] max-h-[44px] sm:min-h-[48px] sm:max-h-[48px] line-clamp-2 break-words overflow-hidden">{product.name}</h3>

                  {/* Stock Status */}
                  <div className="flex items-center mb-1 sm:mb-2 min-h-[20px] sm:min-h-[24px]">
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${(product.stock ?? 0) > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="hidden sm:inline text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                        {(product.stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-2 sm:mb-3 min-h-[28px] sm:min-h-[32px]">
                    <span className="text-base sm:text-lg font-bold text-gray-900 whitespace-nowrap">TK{product.price}</span>
                    <span className={`text-xs sm:text-sm text-gray-500 line-through whitespace-nowrap ${product.original_price ? '' : 'invisible'}`}>
                      TK{product.original_price ?? 0}
                    </span>
                    <span className={`hidden sm:inline text-xs sm:text-sm text-green-600 font-medium whitespace-nowrap ${product.original_price ? '' : 'invisible'}`}>
                      Save TK{((product.original_price ?? product.price) > product.price ? ((product.original_price ?? 0) - product.price).toFixed(2) : '0.00')}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    className="relative overflow-hidden group/button w-full mt-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-95 py-1.5 text-xs sm:py-2.5 sm:text-base rounded-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] group-hover/button:translate-x-full transition-transform duration-700 ease-out"></span>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No products available right now.</p>
          </div>
        )}

        {/* Mobile mini categories are now rendered above via <MobileMiniCategories /> */}

        <div className="text-center mt-16">
          <Button
            variant="outline"
            size="lg"
            className="btn-cta-animated btn-pulse-glow btn-shine border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white bg-transparent px-10 py-5 text-xl font-semibold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl cta-bob will-change-transform"
            onClick={() => router.push("/products")}
            aria-label="View all products"
          >
            View All Products
          </Button>
        </div>
        <style jsx global>{`
          @media (prefers-reduced-motion: no-preference) {
            .cta-bob {
              animation: cta-bob 2.8s ease-in-out infinite;
            }
            .cta-bob:hover,
            .cta-bob:focus-visible {
              animation-play-state: paused;
            }
          }
          @keyframes cta-bob {
            0%, 100% {
              transform: translateY(0);
              box-shadow: 0 10px 24px -12px rgba(251, 191, 36, 0.35);
            }
            50% {
              transform: translateY(-6px);
              box-shadow: 0 14px 28px -12px rgba(251, 191, 36, 0.45);
            }
          }
        `}</style>
      </div>
    </section>
  )
}
