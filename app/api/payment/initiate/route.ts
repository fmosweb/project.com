import { type NextRequest, NextResponse } from "next/server"

function isBkashConfigured() {
  const required = [
    process.env.BKASH_BASE_URL,
    process.env.BKASH_USERNAME,
    process.env.BKASH_PASSWORD,
    process.env.BKASH_APP_KEY,
    process.env.BKASH_APP_SECRET,
    process.env.BKASH_CALLBACK_URL,
  ]
  return required.every(Boolean)
}

function isNagadConfigured() {
  const required = [
    process.env.NAGAD_BASE_URL,
    process.env.NAGAD_MERCHANT_ID,
    process.env.NAGAD_PRIVATE_KEY,
    process.env.NAGAD_PUBLIC_KEY,
    process.env.NAGAD_CALLBACK_URL,
  ]
  return required.every(Boolean)
}

function isRocketConfigured() {
  const required = [
    process.env.ROCKET_BASE_URL,
    process.env.ROCKET_MERCHANT_ID,
    process.env.ROCKET_SECRET,
    process.env.ROCKET_SUCCESS_URL,
    process.env.ROCKET_FAIL_URL,
    process.env.ROCKET_CANCEL_URL,
  ]
  return required.every(Boolean)
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, method, amount, customerInfo } = await request.json()

    let redirectUrl = ""

    switch (method) {
      case "bkash":
        if (!isBkashConfigured()) {
          return NextResponse.json({ error: "bKash কনফিগার করা নেই। অনুগ্রহ করে Cash on Delivery ব্যবহার করুন।" }, { status: 400 })
        }
        // In production, integrate with bKash API
        redirectUrl = `https://checkout.pay.bka.sh/v1.2.0-beta/checkout/payment/create?amount=${amount}&orderId=${orderId}`
        break
      case "nagad":
        if (!isNagadConfigured()) {
          return NextResponse.json({ error: "Nagad কনফিগার করা নেই। অনুগ্রহ করে Cash on Delivery ব্যবহার করুন।" }, { status: 400 })
        }
        // In production, integrate with Nagad API
        redirectUrl = `https://api.mynagad.com/api/dfs/check-out/initialize?amount=${amount}&orderId=${orderId}`
        break
      case "rocket":
        if (!isRocketConfigured()) {
          return NextResponse.json({ error: "Rocket কনফিগার করা নেই। অনুগ্রহ করে Cash on Delivery ব্যবহার করুন।" }, { status: 400 })
        }
        // In production, integrate with Rocket API
        redirectUrl = `https://rocket.com.bd/payment/checkout?amount=${amount}&orderId=${orderId}`
        break
      default:
        throw new Error("অসমর্থিত পেমেন্ট মেথড")
    }

    return NextResponse.json({
      success: true,
      redirectUrl,
      message: `${method} পেমেন্ট গেটওয়েতে রিডাইরেক্ট করা হচ্ছে...`,
    })
  } catch (error) {
    console.error("Payment initiation error:", error)
    return NextResponse.json({ error: "পেমেন্ট শুরু করতে সমস্যা হয়েছে" }, { status: 500 })
  }
}
