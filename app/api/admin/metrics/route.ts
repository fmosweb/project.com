import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const VISITOR_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function GET() {
  try {
    // Live visitors from in-memory heartbeat map
    const g = globalThis as any
    const HEARTBEATS: Map<string, number> | undefined = g.__HEARTBEATS__
    let liveVisitors = 0
    if (HEARTBEATS && HEARTBEATS.size) {
      const now = Date.now()
      for (const [, ts] of HEARTBEATS) {
        if (now - ts <= VISITOR_TTL_MS) liveVisitors++
      }
    }

    const supabase = createAdminClient()

    // Row counts (exact, head-only)
    let products = 0, categories = 0, orders = 0, users = 0
    if (supabase) {
      try {
        const { count: pCount } = await supabase.from("products").select("*", { count: "exact", head: true })
        products = pCount || 0
      } catch {}
      try {
        const { count: cCount } = await supabase.from("categories").select("*", { count: "exact", head: true })
        categories = cCount || 0
      } catch {}
      try {
        const { count: oCount } = await supabase.from("orders").select("*", { count: "exact", head: true })
        orders = oCount || 0
      } catch {}
      try {
        const { count: uCount } = await supabase.from("users").select("*", { count: "exact", head: true })
        users = uCount || 0
      } catch {}
    }

    // Storage overview (best-effort)
    let bucketCount = 0
    let sampleFiles = 0
    if (supabase) {
      try {
        const { data: buckets } = await (supabase as any).storage.listBuckets()
        bucketCount = Array.isArray(buckets) ? buckets.length : 0
        if (Array.isArray(buckets)) {
          const maxBuckets = buckets.slice(0, 3)
          for (const b of maxBuckets) {
            const { data: files } = await (supabase as any).storage.from(b.name).list(undefined, { limit: 100 })
            sampleFiles += Array.isArray(files) ? files.length : 0
          }
        }
      } catch {}
    }

    return NextResponse.json(
      {
        success: true,
        liveVisitors,
        db: { products, categories, orders, users },
        storage: { buckets: bucketCount, filesApprox: sampleFiles },
        updatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}
