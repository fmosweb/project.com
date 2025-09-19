import { NextRequest, NextResponse } from "next/server"
import { unstable_noStore as noStore } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PAID_STATES = ['paid','success','succeeded','captured','settled']

export async function GET(request: NextRequest) {
  try {
    noStore()
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ success: true, data: [] }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit')) || 5))

    const sel = `
      id, user_id, total_amount, payment_method, payment_status, created_at,
      user:user_id (email, name, mobile, phone),
      items:order_items (quantity, price, product:product_id (name))
    `

    // Online payment = payment_method != cash_on_delivery, and paid-like payment_status if present
    const query = supabase
      .from('orders')
      .select(sel)
      .neq('payment_method', 'cash_on_delivery')
      .order('created_at', { ascending: false })
      .limit(limit)

    const { data, error } = await query

    if (error) {
      console.error('[invoices] Error:', error)
      return NextResponse.json({ success: true, data: [] }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const rows = Array.isArray(data) ? data : []

    const filtered = rows.filter((o: any) => {
      const s = String(o?.payment_status || '').toLowerCase()
      // if payment_status missing, keep it (so admin can still see online attempts)
      return !o?.payment_status || PAID_STATES.includes(s)
    })

    const mapped = filtered.map((o: any) => {
      const items = Array.isArray(o?.items) ? o.items : []
      const firstName = items[0]?.product?.name || '-'
      const count = items.length
      const productSummary = count > 1 ? `${firstName} +${count - 1} more` : firstName
      const phone = o?.user?.mobile || o?.user?.phone || ''
      const name = o?.user?.name || ''
      const email = o?.user?.email || ''
      return {
        id: o.id,
        created_at: o.created_at,
        user: { name, email, phone },
        amount: Number(o?.total_amount) || 0,
        payment_method: o?.payment_method || '-',
        payment_status: o?.payment_status || '-',
        product_summary: productSummary,
        items_count: count,
      }
    })

    return NextResponse.json({ success: true, data: mapped }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    console.error('[invoices] Unexpected error:', e)
    return NextResponse.json({ success: false, data: [] }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
