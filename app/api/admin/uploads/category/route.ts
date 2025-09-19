import { NextRequest, NextResponse } from "next/server"
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get('file') as unknown as File | null

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ success: false, message: 'Storage client not configured' }, { status: 500 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: file.type || 'image/jpeg' })

    // Ensure bucket exists and is public
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const hasBucket = (buckets || []).some((b: any) => b?.name === 'categories')
      if (!hasBucket) {
        await supabase.storage.createBucket('categories', { public: true })
      }
    } catch (e: any) {
      // Non-fatal; continue to attempt upload and let error bubble if any
      console.warn('[uploads/category] Bucket ensure warning:', e?.message || e)
    }

    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase()
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = `categories/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('categories')
      .upload(filePath, blob, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ success: false, message: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    const { data } = supabase.storage.from('categories').getPublicUrl(filePath)
    const url = data?.publicUrl || null

    if (!url) {
      return NextResponse.json({ success: false, message: 'Could not resolve public URL' }, { status: 500 })
    }

    return NextResponse.json({ success: true, url, path: filePath })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Unexpected error' }, { status: 500 })
  }
}
