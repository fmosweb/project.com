"use client"

import { useEffect } from "react"

export default function Prefetcher() {
  useEffect(() => {
    const prefetch = async () => {
      try {
        // Products cache warm (5 min TTL)
        const raw = sessionStorage.getItem('products_list_cache')
        let fresh = false
        if (raw) {
          try {
            const cache = JSON.parse(raw)
            fresh = cache && Array.isArray(cache.data) && typeof cache.ts === 'number' && (Date.now() - cache.ts < 300_000)
          } catch {}
        }
        if (!fresh) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000)
            const res = await fetch('/api/products', { signal: controller.signal })
            clearTimeout(timeoutId)
            if (res.ok) {
              const json = await res.json().catch(() => ({}))
              const list = Array.isArray(json?.products) ? json.products : []
              try { sessionStorage.setItem('products_list_cache', JSON.stringify({ data: list, ts: Date.now() })) } catch {}
            }
          } catch (err) {
            console.error('[Prefetcher] Products fetch error:', err instanceof Error ? err.message : 'Unknown')
          }
        }
      } catch (err) {
        console.error('[Prefetcher] Products cache error:', err instanceof Error ? err.message : 'Unknown')
      }

      try {
        // Categories cache warm (5 min TTL)
        const raw = sessionStorage.getItem('cat_options_cache')
        let fresh = false
        if (raw) {
          try {
            const cache = JSON.parse(raw)
            fresh = cache && Array.isArray(cache.data) && typeof cache.ts === 'number' && (Date.now() - cache.ts < 300_000)
          } catch {}
        }
        if (!fresh) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000)
            const res = await fetch('/api/categories', { signal: controller.signal })
            clearTimeout(timeoutId)
            if (res.ok) {
              const json = await res.json().catch(() => ({}))
              const names = Array.isArray(json?.categories) ? json.categories.map((c: any) => c?.name).filter(Boolean) : []
              try { sessionStorage.setItem('cat_options_cache', JSON.stringify({ data: names, ts: Date.now() })) } catch {}
            }
          } catch (err) {
            console.error('[Prefetcher] Categories fetch error:', err instanceof Error ? err.message : 'Unknown')
          }
        }
      } catch (err) {
        console.error('[Prefetcher] Categories cache error:', err instanceof Error ? err.message : 'Unknown')
      }
    }

    // Run shortly after mount to warm caches quickly (target <1s perceived load)
    const id = setTimeout(() => {
      if (typeof window !== 'undefined') {
        prefetch().catch(console.error)
      }
    }, 300)
    // Start heartbeat interval
    const hb = setInterval(() => {
      try { fetch('/api/metrics/heartbeat', { method: 'POST', keepalive: true }) } catch {}
    }, 30_000)
    return () => {
      clearTimeout(id)
      clearInterval(hb)
    }
  }, [])

  return null
}
