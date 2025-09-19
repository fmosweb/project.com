import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const body = await request.json()
    let email: string = (body?.email || "").trim().toLowerCase()
    const userId: string = (body?.user_id || "").trim()
    const items: any[] = Array.isArray(body?.items) ? body.items : []

    if (!email && userId) {
      const { data: userRow, error: userErr } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .maybeSingle()
      if (userErr) {
        return NextResponse.json({ success: false, error: userErr.message }, { status: 500 })
      }
      email = (userRow?.email || "").trim().toLowerCase()
    }

    if (!email) {
      return NextResponse.json({ success: false, error: "email or user_id required" }, { status: 400 })
    }

    // Find or create cart row for this email
    let cartId: string | null = null
    {
      const { data: found, error: findErr } = await supabase
        .from("user_carts")
        .select("id")
        .eq("email", email)
        .maybeSingle()
      if (findErr) {
        return NextResponse.json({ success: false, error: findErr.message }, { status: 500 })
      }
      cartId = found?.id || null
    }

    if (!cartId) {
      const upsertPayload: any = { email }
      if (userId) upsertPayload.user_id = userId
      const { data: created, error: upsertErr } = await supabase
        .from("user_carts")
        .upsert([upsertPayload], { onConflict: "email" })
        .select("id")
        .single()
      if (upsertErr) {
        return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 })
      }
      cartId = created?.id || null
    }

    if (!cartId) {
      return NextResponse.json({ success: false, error: "Failed to create or get cart" }, { status: 500 })
    }

    // Replace items: delete existing then insert new
    {
      const { error: delErr } = await supabase
        .from("user_cart_items")
        .delete()
        .eq("cart_id", cartId)
      if (delErr) {
        return NextResponse.json({ success: false, error: delErr.message }, { status: 500 })
      }
    }

    if (items.length > 0) {
      const rows = items
        .map((it: any) => {
          const pid = (it?.id ?? it?.product_id ?? "").toString()
          const qty = Number(it?.quantity) || 1
          const price = Number(it?.price) || 0
          const original = (typeof it?.originalPrice === 'number' ? it?.originalPrice : Number(it?.original_price))
          return pid ? {
            cart_id: cartId,
            product_id: pid,
            name: String(it?.name || ""),
            price,
            original_price: typeof original === 'number' ? original : price,
            image: String(it?.image || ""),
            quantity: qty,
          } : null
        })
        .filter(Boolean)

      if (rows.length > 0) {
        const { error: insErr } = await supabase
          .from("user_cart_items")
          .insert(rows as any[])
        if (insErr) {
          return NextResponse.json({ success: false, error: insErr.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Unexpected error" }, { status: 500 })
  }
}
