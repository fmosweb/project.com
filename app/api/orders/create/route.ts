import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    console.log("Order data received:", orderData)
    
    const supabase = createAdminClient()

    if (!supabase) {
      console.error("Database connection failed")
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Helper to normalize and validate
    const normalizePaymentMethod = (method: string) => {
      if (!method) return "cash_on_delivery"
      if (method === "cash-on-delivery") return "cash_on_delivery"
      return method
    }
    const isValidUUID = (value: unknown) => {
      if (typeof value !== "string") return false
      // Simple UUID v4 regex
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    }

    // Try to resolve user_id automatically from customer.phone or customer.email if not provided
    let resolvedUserId: string | null = orderData.user_id || null
    try {
      const customerPhone = orderData?.customer?.phone ? String(orderData.customer.phone).trim() : null
      const customerEmail = orderData?.customer?.email ? String(orderData.customer.email).trim().toLowerCase() : null
      if (!resolvedUserId && (customerPhone || customerEmail)) {
        let userLookup = null as any
        if (customerPhone) {
          const { data } = await supabase
            .from("users")
            .select("id")
            .eq("mobile", customerPhone)
            .maybeSingle()
          userLookup = data
        }
        if (!userLookup && customerEmail) {
          const { data } = await supabase
            .from("users")
            .select("id")
            .eq("email", customerEmail)
            .maybeSingle()
          userLookup = data
        }
        if (userLookup?.id && isValidUUID(userLookup.id)) {
          resolvedUserId = userLookup.id
        }
      }
    } catch (resolveErr) {
      console.warn("Could not resolve user_id from customer info:", resolveErr)
    }

    // Simple validation - only check essential fields
    if (!orderData.customer?.name || !orderData.customer?.phone || !orderData.shipping?.address || !orderData.payment?.method) {
      console.error("Missing required fields:", {
        name: orderData.customer?.name,
        phone: orderData.customer?.phone,
        address: orderData.shipping?.address,
        payment: orderData.payment?.method
      })
      return NextResponse.json({ 
        error: "আবশ্যক তথ্য অনুপস্থিত"
      }, { status: 400 })
    }

    // Compute totals on server: subtotal from items + fixed shipping (150). Ignore VAT/COD.
    const computedSubtotal = Array.isArray(orderData.items)
      ? orderData.items.reduce((sum: number, it: any) => {
          const price = Number(it?.price) || 0
          const qty = Number(it?.quantity) || 0
          return sum + price * qty
        }, 0)
      : (Number(orderData.subtotal) || 0)
    const shippingCharge = 150
    const computedTotal = computedSubtotal + shippingCharge

    // Create order in database - let DB auto-generate the UUID id
    const orderInsertData = {
      user_id: resolvedUserId,
      total_amount: computedTotal,
      status: "pending",
      shipping_address: `${orderData.customer.name}, ${orderData.customer.phone}, ${orderData.shipping.address}, ${orderData.shipping.thana}, ${orderData.shipping.district}, ${orderData.shipping.division}`,
      payment_method: normalizePaymentMethod(orderData.payment.method)
    }
    
    console.log("Inserting order data:", orderInsertData)
    
    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .insert(orderInsertData)
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      console.error("Error code:", orderError.code)
      console.error("Error details:", orderError.details)
      console.error("Error hint:", orderError.hint)
      return NextResponse.json({ 
        error: "অর্ডার তৈরিতে সমস্যা হয়েছে",
        details: orderError.message,
        code: orderError.code
      }, { status: 500 })
    }
    
    console.log("Order created successfully:", orderResult)

    // Create order items if they exist
    if (orderData.items && orderData.items.length > 0) {
      console.log("Creating order items...")
      const orderItems = orderData.items
        .map((item: any) => {
          const productId = typeof item.id === "string" && isValidUUID(item.id) ? item.id : null
          if (!productId) {
            console.warn("Skipping invalid product_id for order item. Received id:", item.id)
            return null
          }
          return {
            order_id: orderResult.id,
            product_id: productId,
            quantity: Number(item.quantity) || 0,
            price: parseFloat(item.price) || 0
          }
        })
        // Only insert items with positive quantity and valid product_id
        .filter((it: any) => it && it.quantity > 0)
      
      console.log("Order items to insert:", orderItems)
      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems)

        if (itemsError) {
          console.error("Order items creation error:", itemsError)
          return NextResponse.json({ 
            error: "অর্ডার আইটেম তৈরিতে সমস্যা হয়েছে",
            details: itemsError.message 
          }, { status: 500 })
        }

        // Decrement product stock for each order item
        console.log("Updating product stock levels for order items...")
        for (const it of orderItems) {
          try {
            // Fetch current stock
            const { data: prod, error: prodErr } = await supabase
              .from("products")
              .select("id, stock")
              .eq("id", it.product_id)
              .single()

            if (prodErr) {
              console.error("Stock fetch failed for product", it.product_id, prodErr)
              continue
            }

            const current = Number(prod?.stock) || 0
            const qty = Number(it.quantity) || 0
            const newStock = Math.max(0, current - qty)

            if (newStock === current) {
              console.warn("No stock change for product", it.product_id, { current, qty })
              continue
            }

            const { error: updErr } = await supabase
              .from("products")
              .update({ stock: newStock, updated_at: new Date().toISOString() })
              .eq("id", it.product_id)

            if (updErr) {
              console.error("Stock update failed for product", it.product_id, updErr)
            } else {
              console.log("Stock updated for product", it.product_id, { from: current, to: newStock })
            }
          } catch (stockErr) {
            console.error("Unexpected stock update error for product", it.product_id, stockErr)
          }
        }
      } else {
        console.warn("No valid order items to insert (likely using mock cart without UUID product IDs).")
      }
      
      console.log("Order items created successfully")
    }

    return NextResponse.json({
      success: true,
      id: orderResult.id,
      message: "অর্ডার সফলভাবে তৈরি হয়েছে",
      order: orderResult
    })
  } catch (error) {
    console.error("Unexpected error in order creation:", error)
    return NextResponse.json({ 
      error: "অর্ডার তৈরিতে সমস্যা হয়েছে",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
