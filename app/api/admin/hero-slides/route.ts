import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { createAdminClient } from "@/lib/supabase/admin"

const FILE_PATH = path.join(process.cwd(), "database", "hero_slides.json")

type Slide = { id: string; url: string; name?: string; created_at?: string }

async function readFileSlides(): Promise<Array<Slide>> {
  try {
    const raw = await fs.promises.readFile(FILE_PATH, "utf-8")
    const json = JSON.parse(raw)
    if (Array.isArray(json)) return json
    return []
  } catch {
    return []
  }
}

async function writeFileSlides(list: Array<Slide>) {
  await fs.promises.mkdir(path.dirname(FILE_PATH), { recursive: true })
  await fs.promises.writeFile(FILE_PATH, JSON.stringify(list, null, 2), "utf-8")
}

export async function GET() {
  try {
    const admin = createAdminClient()
    if (admin) {
      const { data, error } = await admin.from("hero_slides").select("id, url, name, created_at").order("created_at", { ascending: false })
      if (!error && Array.isArray(data)) {
        return NextResponse.json({ success: true, slides: data })
      }
    }
    const slides = await readFileSlides()
    return NextResponse.json({ success: true, slides, fallback: "file" })
  } catch (e) {
    return NextResponse.json({ success: true, slides: await readFileSlides(), fallback: "file" })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const url = String(body.url || '').trim()
    const name = String(body.name || '').trim() || null
    if (!url) return NextResponse.json({ success: false, message: "url required" }, { status: 400 })

    const admin = createAdminClient()
    if (admin) {
      const payload: any = { url }
      if (name) payload.name = name
      const { data, error } = await admin.from("hero_slides").insert(payload).select("id, url, name, created_at").single()
      if (!error && data) return NextResponse.json({ success: true, slide: data })
    }

    const list = await readFileSlides()
    const slide: Slide = { id: Date.now().toString(), url, name: name || undefined, created_at: new Date().toISOString() }
    list.unshift(slide)
    await writeFileSlides(list)
    return NextResponse.json({ success: true, slide, fallback: "file" })
  } catch (e) {
    return NextResponse.json({ success: false, message: "server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id') || ''
    if (!id) return NextResponse.json({ success: false, message: 'id required' }, { status: 400 })

    const admin = createAdminClient()
    if (admin) {
      const { error } = await admin.from('hero_slides').delete().eq('id', id)
      if (!error) return NextResponse.json({ success: true })
    }

    const list = await readFileSlides()
    const next = list.filter(s => String(s.id) !== String(id))
    await writeFileSlides(next)
    return NextResponse.json({ success: true, fallback: 'file' })
  } catch (e) {
    return NextResponse.json({ success: false, message: 'server error' }, { status: 500 })
  }
}
