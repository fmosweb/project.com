"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

// Very small mobile-only categories strip for home page
// Renders only on <640px to satisfy the requirement

type UICategory = {
  id: string
  name: string
  image_url?: string
  slug?: string
}

export default function MobileMiniCategories() {
  const router = useRouter()
  const [categories, setCategories] = useState<UICategory[]>([])
  const [rot, setRot] = useState(0)
  const cacheUsedRef = useRef(false)

  // Normalize Supabase storage public URLs when necessary
  const normalizeImageUrl = (url?: string | null) => {
    if (!url) return null
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (base && (url.startsWith("/storage") || url.startsWith("storage"))) {
      return `${base}${url.startsWith('/') ? '' : '/'}${url}`
    }
    return url
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // 1) Warm from sessionStorage (5 min TTL)
      try {
        const raw = typeof window !== 'undefined' ? sessionStorage.getItem('cats_cache') : null
        if (raw) {
          const cache = JSON.parse(raw)
          const fresh = cache && Array.isArray(cache.data) && typeof cache.ts === 'number' && (Date.now() - cache.ts < 300_000)
          if (fresh) {
            if (!cancelled) {
              setCategories(cache.data)
              cacheUsedRef.current = true
            }
          }
        }
      } catch {}

      // 2) Background revalidate (bypass CDN if ?nocache=1)
      try {
        const noCache = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('nocache') === '1'
        const url = '/api/categories' + (noCache ? `?t=${Date.now()}` : '')
        const res = await fetch(url)
        const json = await res.json().catch(() => ({}))
        const list: any[] = Array.isArray(json?.categories) ? json.categories : []
        const mapped: UICategory[] = list.map((c: any) => ({
          id: String(c?.id ?? ''),
          name: String(c?.name ?? 'Category'),
          image_url: c?.image_url || '/placeholder.svg',
          slug: c?.slug || ''
        }))
        if (!cancelled) {
          // Update only if changed
          const changed = mapped.length !== categories.length || mapped.some((c, i) => String(c.id) !== String((categories[i] || {}).id))
          if (changed) setCategories(mapped)
          try { sessionStorage.setItem('cats_cache', JSON.stringify({ data: mapped, ts: Date.now() })) } catch {}
        }
      } catch (e) {
        console.error('[MobileMiniCategories] categories fetch failed', e)
        if (!cancelled && !cacheUsedRef.current) setCategories([])
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Rotate displayed categories among fixed 3 slots (slower)
  useEffect(() => {
    if (categories.length < 3) return
    const id = setInterval(() => setRot((v) => (v + 1) % 3), 3800)
    return () => clearInterval(id)
  }, [categories.length])

  if (!categories || categories.length === 0) return null

  const base = categories.slice(0, 3)
  const showCats = base.length < 3
    ? base
    : [base[(rot) % 3], base[(rot + 1) % 3], base[(rot + 2) % 3]]

  return (
    <section className="sm:hidden block relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 mb-1">
        <div className="grid grid-cols-3 gap-2">
          {showCats.map((cat, idx) => (
            <div
              key={`slot-${idx}`}
              className="group relative cat-pop rounded-xl p-[1.5px] bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm"
              style={{ ['--delay' as any]: `${idx * 80}ms` }}
            >
              <button
                className="relative btn-shine btn-pulse-glow w-full bg-white rounded-[10px] shadow-sm p-2 flex flex-col items-center justify-center transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5 active:scale-95 border border-transparent ring-1 ring-amber-200/60 hover:ring-amber-300"
                onClick={() => router.push(`/products?category=${encodeURIComponent(cat.slug || cat.id)}`)}
                aria-label={`View ${cat.name} products`}
              >
              <div
                key={cat.id}
                className="cat-swap w-full flex flex-col items-center"
                style={{ ['--enterX' as any]: '-10px' }}
              >
                <div className="w-9 h-9 rounded-md overflow-hidden mb-1 ring-1 ring-amber-200/70 bg-white">
                  <img src={normalizeImageUrl(cat.image_url) || '/placeholder.svg'} alt={cat.name} className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-95" />
                </div>
                <span className="text-[10px] font-medium text-gray-700 group-hover:text-amber-700 truncate w-full text-center">{cat.name}</span>
              </div>
              </button>
            </div>
          ))}
        </div>
      </div>
      <style jsx global>{`
        .cat-pop { opacity: 0; animation: cat-pop-in .55s ease-out var(--delay, 0ms) both; }
        @keyframes cat-pop-in {
          0% { opacity: 0; transform: translateX(-6px) scale(0.96); }
          60% { opacity: 1; transform: translateX(0) scale(1.02); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .cat-swap { animation: cat-swap-in .45s ease-out; }
        @keyframes cat-swap-in {
          0% { opacity: 0; transform: translateX(var(--enterX, 0)) scale(0.98); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cat-pop { animation: none !important; }
          .cat-swap { animation: none !important; }
        }
      `}</style>
    </section>
  )
}
