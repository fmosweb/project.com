import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    noStore()
    const supabase = createAdminClient()

    let dbBytes: number | null = null
    let dbMB: number | null = null

    // Try to fetch database size via RPC function if present
    if (supabase) {
      try {
        const { data, error } = await (supabase as any).rpc('get_db_size')
        if (!error && typeof data === 'number') {
          dbBytes = data
          dbMB = Math.round((data / 1_000_000) * 10) / 10
        }
      } catch {}
    }

    // Storage usage: sum file sizes from all buckets
    let storageBytes = 0
    let storageMB = 0
    if (supabase) {
      try {
        const { data: buckets } = await (supabase as any).storage.listBuckets()
        if (Array.isArray(buckets)) {
          for (const b of buckets) {
            let offset = 0
            const limit = 1000
            while (true) {
              const { data: files } = await (supabase as any).storage.from(b.name).list(undefined, { limit, offset })
              const arr = Array.isArray(files) ? files : []
              for (const f of arr) {
                const size = typeof (f as any)?.size === 'number' ? (f as any).size : 0
                storageBytes += size
              }
              if (arr.length < limit) break
              offset += limit
            }
          }
          storageMB = Math.round((storageBytes / 1_000_000) * 10) / 10
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      database: { bytes: dbBytes, mb: dbMB },
      storage: { bytes: storageBytes, mb: storageMB },
      updatedAt: new Date().toISOString(),
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
