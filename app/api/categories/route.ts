import { NextResponse, type NextRequest } from "next/server"
import { getCategories } from "@/lib/services/admin"
import { slugify } from "@/lib/utils"

// Public cached categories API
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const noCache = url.searchParams.get('nocache') === '1' || url.searchParams.has('t') || url.searchParams.get('noStore') === '1'
    const result = await getCategories()
    if (result.error) {
      const headers = {
        "Cache-Control": "no-store, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Vary": "*",
      }
      return NextResponse.json(
        { success: false, categories: [], error: String(result.error) },
        { headers }
      )
    }

    const list: any[] = Array.isArray(result.data) ? result.data : []

    // Map to minimal fields + slug (compute if missing)
    const minimal = list.map((c: any) => ({
      id: String(c.id ?? ""),
      name: String(c.name ?? "Category"),
      image_url: c.image_url ?? undefined,
      slug: c.slug ? String(c.slug) : slugify(String(c.name ?? "")),
    }))

    const headers = noCache
      ? {
          "Cache-Control": "no-store, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Vary": "*",
        }
      : {
          "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
          "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "Vary": "*",
        }

    return NextResponse.json(
      { success: true, categories: minimal },
      { headers }
    )
  } catch (e) {
    return NextResponse.json(
      { success: false, categories: [], error: "Failed to load categories" },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Vary": "*",
        },
      }
    )
  }
}
