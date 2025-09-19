import { NextResponse, type NextRequest } from "next/server"
import { destroyAdminSession } from "@/lib/admin-session"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_session")?.value || null
    if (token) destroyAdminSession(token)
    const res = NextResponse.json({ success: true, message: "Logged out" })
    res.cookies.set("admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
    return res
  } catch (e) {
    return NextResponse.json({ success: false, message: "Logout failed" }, { status: 500 })
  }
}
