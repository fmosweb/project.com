import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { createAdminClient } from "@/lib/supabase/admin"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "hero")
const JSON_FILE = path.join(process.cwd(), "database", "hero_slides.json")

async function readFileSlides(): Promise<Array<{ id: string; url: string; name?: string; created_at?: string }>> {
  try {
    const raw = await fs.promises.readFile(JSON_FILE, "utf-8")
    const json = JSON.parse(raw)
    return Array.isArray(json) ? json : []
  } catch {
    return []
  }
}

async function writeFileSlides(list: Array<{ id: string; url: string; name?: string; created_at?: string }>) {
  await fs.promises.mkdir(path.dirname(JSON_FILE), { recursive: true })
  await fs.promises.writeFile(JSON_FILE, JSON.stringify(list, null, 2), "utf-8")
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    const name = String(form.get("name") || "").trim() || null

    if (!file) return NextResponse.json({ success: false, message: "file required" }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const safeName = (file.name || "upload").replace(/[^a-zA-Z0-9_.-]/g, "_")
    const filename = `${Date.now()}-${safeName}`

    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true })
    const fp = path.join(UPLOAD_DIR, filename)
    await fs.promises.writeFile(fp, buffer)

    const publicUrl = `/uploads/hero/${filename}`

    const admin = createAdminClient()
    if (admin) {
      const payload: any = { url: publicUrl }
      if (name) payload.name = name
      const { data, error } = await admin.from("hero_slides").insert(payload).select("id, url, name, created_at").single()
      if (!error && data) return NextResponse.json({ success: true, slide: data })
    }

    const list = await readFileSlides()
    const slide = { id: Date.now().toString(), url: publicUrl, name: name || undefined, created_at: new Date().toISOString() }
    list.unshift(slide)
    await writeFileSlides(list)
    return NextResponse.json({ success: true, slide, fallback: "file" })
  } catch (e) {
    console.error("[hero-slides/upload] error", e)
    return NextResponse.json({ success: false, message: "server error" }, { status: 500 })
  }
}
