import { NextResponse, type NextRequest } from "next/server"
import { getAdminSession } from "@/lib/admin-session"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value || null
  const sess = getAdminSession(token)
  if (!sess) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json({ success: true, admin: sess.admin })
}
