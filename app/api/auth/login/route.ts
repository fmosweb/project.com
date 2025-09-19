import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/lib/services/auth"

export async function POST(request: NextRequest) {
  try {
    const { mobile, password } = await request.json()

    if (!mobile || !password) {
      return NextResponse.json({ message: "মোবাইল নম্বর এবং পাসওয়ার্ড প্রয়োজন" }, { status: 400 })
    }

    // Authenticate user
    const user = await loginUser(mobile, password)

    return NextResponse.json({
      message: "লগইন সফল হয়েছে",
      user,
    })
  } catch (error: any) {
    console.error("[v0] Login error:", error)
    return NextResponse.json(
      {
        message: error.message || "মোবাইল নম্বর বা পাসওয়ার্ড ভুল",
      },
      { status: 401 },
    )
  }
}
