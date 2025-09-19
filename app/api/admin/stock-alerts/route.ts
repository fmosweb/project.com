import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    noStore()
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ success: true, count: 0, items: [] }, { headers: { 'Cache-Control': 'no-store' } })
    }

    // Fetch out-of-stock products (stock <= 0 or NULL)
    const query = supabase
      .from('products')
      .select('id,name,stock,images,updated_at', { count: 'exact' })
      .or('stock.lte.0,stock.is.null')
      .order('updated_at', { ascending: false })
      .limit(10)

    const { data, error, count } = await query

    if (error) {
      console.error('[stock-alerts] Error:', error)
      return NextResponse.json({ success: true, count: 0, items: [] }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const items = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name || 'Unnamed product',
      stock: Number(p?.stock ?? 0) || 0,
      image: (Array.isArray(p?.images) && p.images[0]) ? p.images[0] : (p?.image_url || '/placeholder.svg'),
      updated_at: p.updated_at,
    }))

    return NextResponse.json({ success: true, count: count || items.length, items }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    console.error('[stock-alerts] Unexpected error:', e)
    return NextResponse.json({ success: false, count: 0, items: [] }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
