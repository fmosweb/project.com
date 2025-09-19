import { NextResponse, type NextRequest } from "next/server"
import { getProductsFiltered } from "@/lib/services/admin"

// Public cached products API
// Returns only active products and sets strong caching headers so the response
// is served quickly from the CDN with stale-while-revalidate behavior.
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const noCache = url.searchParams.get('nocache') === '1' || url.searchParams.has('t') || url.searchParams.get('noStore') === '1'
    const featuredParam = url.searchParams.get('featured')
    const activeParam = url.searchParams.get('active')
    const limitParam = url.searchParams.get('limit')
    const fallbackParam = url.searchParams.get('fallback')

    const filters = {
      active: activeParam === '0' ? false : true,
      featured: featuredParam === '1' || featuredParam === 'true',
      limit: limitParam ? Math.max(1, Math.min(50, parseInt(limitParam, 10))) : undefined,
    }

    let result = await getProductsFiltered(filters)
    if (result.error) throw new Error(result.error)

    // Optional server-side fallback: if featured requested but empty, fallback to active list
    if (filters.featured && Array.isArray(result.data) && result.data.length === 0 && fallbackParam === 'active') {
      result = await getProductsFiltered({ active: true, featured: false, limit: filters.limit })
      if (result.error) throw new Error(result.error)
    }

    // Map to essential fields to reduce payload size
    const minimal = (Array.isArray(result.data) ? result.data : []).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      original_price: p.original_price ?? null,
      images: Array.isArray(p.images) ? p.images : undefined,
      image_url: p.image_url ?? undefined,
      badge: p.badge ?? undefined,
      stock: p.stock ?? 0,
      rating: p.rating ?? 0,
      reviews: p.reviews ?? 0,
      created_at: p.created_at,
      category: p.category ?? undefined,
      brand: p.brand ?? undefined,
      is_featured: p.is_featured ?? false,
      is_active: p.is_active !== false,
    }))

    const headers = noCache
      ? {
          "Cache-Control": "no-store, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Vary": "*",
        }
      : {
          // Cache for CDN (s-maxage) and allow serving stale while revalidating
          // Allow a small browser cache window to speed up back/forward nav
          "Cache-Control": "public, max-age=30, s-maxage=300, stale-while-revalidate=900",
          "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
          "Vary": "*",
        }

    const res = NextResponse.json(
      { success: true, products: minimal },
      { headers }
    )
    return res
  } catch (e) {
    return NextResponse.json(
      { success: false, products: [], message: "Failed to load products" },
      { status: 500 }
    )
  }
}
