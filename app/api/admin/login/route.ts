import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminCredentials } from "@/lib/admin-auth"
import { verifyRecaptcha } from "@/lib/recaptcha"
import { createAdminSession } from "@/lib/admin-session"

// Simple in-memory rate limiting by IP (reset on successful login)
type AttemptInfo = { count: number; blockedUntil?: number; lastAttempt: number }
const attemptsByIp = new Map<string, AttemptInfo>()
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes window
const MAX_ATTEMPTS = 5
const BASE_BLOCK_MS = 10 * 60 * 1000 // 10 minutes first block

function getClientIp(req: NextRequest): string {
  const xfwd = req.headers.get("x-forwarded-for") || ""
  const ip = (xfwd.split(",")[0] || req.ip || "unknown").trim()
  return ip || "unknown"
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, recaptchaToken } = await request.json()

    console.log("[v1] Admin login attempt:", { email, passwordLength: password?.length })

    if (!email || !password) {
      console.log("[v0] Missing email or password")
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Rate limit by IP
    const ip = getClientIp(request)
    const now = Date.now()
    const info: AttemptInfo = attemptsByIp.get(ip) || { count: 0, lastAttempt: 0 }
    // Reset window if elapsed
    if (info.lastAttempt && now - info.lastAttempt > WINDOW_MS) {
      info.count = 0
      info.blockedUntil = undefined
    }
    info.lastAttempt = now
    if (info.blockedUntil && now < info.blockedUntil) {
      const retryAfter = Math.ceil((info.blockedUntil - now) / 1000)
      return new NextResponse(
        JSON.stringify({ message: "Too many attempts. Try again later.", retryAfterSeconds: retryAfter }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) } }
      )
    }

    // reCAPTCHA verification (required if secret is configured)
    const hasSecret = Boolean(process.env.RECAPTCHA_SECRET_KEY)
    if (hasSecret) {
      const ok = await verifyRecaptcha(recaptchaToken)
      if (!ok) {
        console.warn("[captcha] Verification failed")
        return NextResponse.json({ message: "reCAPTCHA verification failed" }, { status: 401 })
      }
    }

    // Verify admin credentials
    const admin = await verifyAdminCredentials(email, password)

    console.log("[v0] Credential verification result:", admin ? "SUCCESS" : "FAILED")

    if (!admin) {
      console.log("[v0] Invalid credentials for email:", email)
      // Increment attempts and possibly block
      info.count = (info.count || 0) + 1
      if (info.count >= MAX_ATTEMPTS) {
        const over = info.count - MAX_ATTEMPTS + 1
        const multiplier = Math.min(8, Math.pow(2, Math.max(0, over - 1))) // 1x,2x,4x,8x cap
        info.blockedUntil = now + BASE_BLOCK_MS * multiplier
      }
      attemptsByIp.set(ip, info)
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Login successful
    console.log("[v0] Admin login successful for:", admin.email)
    // Reset attempts on success
    attemptsByIp.delete(ip)

    // Create server session and set cookie
    const sess = createAdminSession({
      id: String(admin.id),
      email: String(admin.email),
      name: String((admin as any).name || "Admin"),
      role: (admin as any).role === "super_admin" ? "super_admin" : "admin",
    })
    const res = NextResponse.json({
      message: "Admin login successful",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    })
    res.cookies.set("admin_session", sess.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 6, // 6 hours
    })
    return res
  } catch (error) {
    console.error("[v1] Admin login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
