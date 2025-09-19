import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Simple hardcoded admin check
    if (email === "admin@fmosweb.com" && password === "admin123") {
      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: { email, role: "admin" },
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials",
      },
      { status: 401 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    )
  }
}
