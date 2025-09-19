import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = 'force-dynamic'
export const revalidate = 0

function monthKey(d: Date) {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function monthLabel(d: Date) {
  return d.toLocaleString('en', { month: 'short' })
}

function last12Months() {
  const arr: { key: string; start: Date; end: Date; label: string }[] = []
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  for (let i = 11; i >= 0; i--) {
    const dt = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - i, 1))
    const end = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 1))
    arr.push({ key: monthKey(dt), start: dt, end, label: monthLabel(dt) })
  }
  return arr
}

export async function GET() {
  try {
    noStore()
    const supabase = createAdminClient()
    const months = last12Months()

    const result = months.map(m => ({ key: m.key, label: m.label, users: 0, sales: 0 }))

    if (!supabase) {
      return NextResponse.json({ success: true, months: result }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const fromISO = months[0].start.toISOString()
    const toISO = months[months.length - 1].end.toISOString()

    // Users: use users table as the source of truth
    const usersRes = await supabase
      .from('users')
      .select('id, created_at')
      .gte('created_at', fromISO)
      .lt('created_at', toISO)

    const usersRows: any[] = (usersRes as any)?.data || []

    // Orders for sales: delivered only; subtract shipping fee per order
    const ordersRes = await supabase
      .from('orders')
      .select('total_amount, status, created_at, payment_status')
      .gte('created_at', fromISO)
      .lt('created_at', toISO)

    const ordersRows: any[] = (ordersRes as any)?.data || []

    const idxByKey = new Map(result.map((r, i) => [r.key, i]))

    // Bucket users
    for (const row of usersRows) {
      const ts = new Date(row?.created_at || row?.createdAt || 0)
      if (isNaN(ts.getTime())) continue
      const key = monthKey(new Date(Date.UTC(ts.getUTCFullYear(), ts.getUTCMonth(), 1)))
      const idx = idxByKey.get(key)
      if (idx !== undefined) result[idx].users += 1
    }

    // Bucket sales
    const revenueStatuses = new Set(['delivered'])
    const shippingFeePerOrder = 150
    for (const row of ordersRows) {
      const ts = new Date(row?.created_at || row?.createdAt || 0)
      if (isNaN(ts.getTime())) continue
      const key = monthKey(new Date(Date.UTC(ts.getUTCFullYear(), ts.getUTCMonth(), 1)))
      const idx = idxByKey.get(key)
      if (idx === undefined) continue
      const status = String(row?.status || '').toLowerCase()
      if (revenueStatuses.has(status)) {
        const amt = Math.max(0, (Number(row?.total_amount) || 0) - shippingFeePerOrder)
        result[idx].sales += amt
      }
    }

    return NextResponse.json({ success: true, months: result }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ success: false, months: [] }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
