import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const email = searchParams.get('email')?.trim().toLowerCase() || ''
    const phone = searchParams.get('phone')?.trim() || ''

    let resolvedUserId = userId || ''

    // Resolve user id by email if not provided
    if (!resolvedUserId && email) {
      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()
      if (userErr) {
        return NextResponse.json({ success: false, error: userErr.message }, { status: 500 })
      }
      resolvedUserId = userRow?.id || ''
    }

    if (resolvedUserId) {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, items:order_items(*, product:product_id(name))`)
        .eq('user_id', resolvedUserId)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, data: data || [] })
    }

    // Fallback: try phone in shipping_address if provided
    if (phone) {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, items:order_items(*, product:product_id(name))`)
        .ilike('shipping_address', `%${phone}%`)
        .order('created_at', { ascending: false })
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, data: data || [] })
    }

    // Still no identifier; return empty list
    return NextResponse.json({ success: true, data: [] })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch orders' }, { status: 500 })
  }
}
