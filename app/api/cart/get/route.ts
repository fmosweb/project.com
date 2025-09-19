import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const rawEmail = (searchParams.get("email") || "").trim().toLowerCase()
    const userId = (searchParams.get("user_id") || "").trim()

    let email = rawEmail

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
      return NextResponse.json({ success: true, data: [] })
    }

    const { data: cartRow, error: cartErr } = await supabase
      .from("user_carts")
      .select("id, email, user_id")
      .eq("email", email)
      .maybeSingle()

    if (cartErr) {
      return NextResponse.json({ success: false, error: cartErr.message }, { status: 500 })
    }

    if (!cartRow?.id) {
      return NextResponse.json({ success: true, data: [] })
    }

    const { data: items, error: itemsErr } = await supabase
      .from("user_cart_items")
      .select("product_id, name, price, original_price, image, quantity")
      .eq("cart_id", cartRow.id)
      .order("created_at", { ascending: true })

    if (itemsErr) {
      return NextResponse.json({ success: false, error: itemsErr.message }, { status: 500 })
    }

    const mapped = (items || []).map((it: any) => ({
      id: it.product_id,
      name: it.name || "",
      price: Number(it.price) || 0,
      originalPrice: typeof it.original_price === 'number' ? Number(it.original_price) : (Number(it.price) || 0),
      image: it.image || "",
      quantity: Number(it.quantity) || 1,
    }))

    return NextResponse.json({ success: true, data: mapped })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Unexpected error" }, { status: 500 })
  }
}
