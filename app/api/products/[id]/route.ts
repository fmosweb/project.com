import { NextResponse, type NextRequest } from "next/server"
import { getProductById as getProductAdmin } from "@/lib/services/admin"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = (params?.id || "").toString()
    if (!id) {
      return NextResponse.json({ success: false, message: "Missing product id" }, { status: 400 })
    }

    const { data, error } = await getProductAdmin(id)
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(
      { success: true, product: data },
      {
        headers: {
          // Cache product details well at the CDN and allow serving stale while revalidating
          "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
          "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          "Vary": "*",
        },
      }
    )
  } catch (e) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
