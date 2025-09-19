import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login") && !pathname.startsWith("/api")
  const isAdminApi = pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login")

  if (isAdminPage) {
    const token = request.cookies.get("admin_session")?.value
    if (!token) {
      const url = new URL("/admin/login", request.url)
      return NextResponse.redirect(url)
    }
  }

  if (isAdminApi) {
    const token = request.cookies.get("admin_session")?.value
    if (!token) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
