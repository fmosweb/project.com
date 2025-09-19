import { NextResponse } from "next/server"

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

export async function GET() {
  const bkash = isBkashConfigured()
  const nagad = isNagadConfigured()
  const rocket = isRocketConfigured()
  const onlineAvailable = bkash || nagad || rocket

  return NextResponse.json({ onlineAvailable, gateways: { bkash, nagad, rocket } })
}
