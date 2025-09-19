import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import fs from "fs"
import path from "path"

// Fallback JSON file path for local/dev environments
const SETTINGS_FILE = path.join(process.cwd(), "database", "site_settings.json")

async function readFromFile() {
  try {
    const raw = await fs.promises.readFile(SETTINGS_FILE, "utf-8")
    const json = JSON.parse(raw)
    return {
      contact_email: typeof json.contact_email === "string" ? json.contact_email : "fmosweb@gmail.com",
      contact_phone: typeof json.contact_phone === "string" ? json.contact_phone : "+880 1309 179246",
      about: typeof json.about === "string" ? json.about : "Your trusted e-commerce platform for premium quality products. We bring you the best shopping experience with secure payments and fast delivery.",
      location: typeof json.location === "string" ? json.location : "Dhaka, Bangladesh",
      social_facebook: typeof json.social_facebook === "string" ? json.social_facebook : "",
      social_instagram: typeof json.social_instagram === "string" ? json.social_instagram : "",
      social_youtube: typeof json.social_youtube === "string" ? json.social_youtube : "",
      social_x: typeof json.social_x === "string" ? json.social_x : "",
      shipping_title: typeof json.shipping_title === "string" ? json.shipping_title : "Free Shipping",
      shipping_sub: typeof json.shipping_sub === "string" ? json.shipping_sub : "On orders over TK50",
      warranty_title: typeof json.warranty_title === "string" ? json.warranty_title : "2 Year Warranty",
      warranty_sub: typeof json.warranty_sub === "string" ? json.warranty_sub : "Full coverage",
      returns_title: typeof json.returns_title === "string" ? json.returns_title : "30-Day Returns",
      returns_sub: typeof json.returns_sub === "string" ? json.returns_sub : "No questions asked",
      hero_title_prefix: typeof json.hero_title_prefix === "string" ? json.hero_title_prefix : "Premium Quality",
      hero_title_highlight: typeof json.hero_title_highlight === "string" ? json.hero_title_highlight : "Products",
      hero_title_suffix: typeof json.hero_title_suffix === "string" ? json.hero_title_suffix : "for Modern Living",
      hero_subtitle: typeof json.hero_subtitle === "string" ? json.hero_subtitle : "Discover our curated collection of high-quality products designed to enhance your lifestyle. From electronics to fashion, we bring you the best at unbeatable prices.",
      hero_stat_primary: typeof json.hero_stat_primary === "string" ? json.hero_stat_primary : "1000+ Products",
    }
  } catch {
    return {
      contact_email: "fmosweb@gmail.com",
      contact_phone: "+880 1309 179246",
      about: "Your trusted e-commerce platform for premium quality products. We bring you the best shopping experience with secure payments and fast delivery.",
      location: "Dhaka, Bangladesh",
      social_facebook: "",
      social_instagram: "",
      social_youtube: "",
      social_x: "",
      shipping_title: "Free Shipping",
      shipping_sub: "On orders over TK50",
      warranty_title: "2 Year Warranty",
      warranty_sub: "Full coverage",
      returns_title: "30-Day Returns",
      returns_sub: "No questions asked",
      hero_title_prefix: "Premium Quality",
      hero_title_highlight: "Products",
      hero_title_suffix: "for Modern Living",
      hero_subtitle: "Discover our curated collection of high-quality products designed to enhance your lifestyle. From electronics to fashion, we bring you the best at unbeatable prices.",
      hero_stat_primary: "1000+ Products",
    }
  }
}

async function writeToFile(data: { contact_email: string; contact_phone: string; about: string; location: string; social_facebook: string; social_instagram: string; social_youtube: string; social_x: string; shipping_title: string; shipping_sub: string; warranty_title: string; warranty_sub: string; returns_title: string; returns_sub: string; hero_title_prefix: string; hero_title_highlight: string; hero_title_suffix: string; hero_subtitle: string; hero_stat_primary: string }) {
  try {
    await fs.promises.mkdir(path.dirname(SETTINGS_FILE), { recursive: true })
    await fs.promises.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (e) {
    console.error("[site-settings] write file error", e)
    return false
  }
}

export async function GET() {
  try {
    const admin = createAdminClient()
    if (admin) {
      // Try to read from Supabase table
      const { data, error } = await admin
        .from("site_settings")
        .select("contact_email, contact_phone, about, location, social_facebook, social_instagram, social_youtube, social_x, shipping_title, shipping_sub, warranty_title, warranty_sub, returns_title, returns_sub, hero_title_prefix, hero_title_highlight, hero_title_suffix, hero_subtitle, hero_stat_primary")
        .limit(1)
        .maybeSingle()

      if (!error && data) {
        return NextResponse.json(
          { success: true, settings: data },
          {
            headers: {
              // Cache in browser a bit, CDN longer, and allow serving stale while revalidating
              "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
              "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
              "Vary": "*",
            },
          }
        )
      }

      // If table missing or other error, fall back to file
      const fileSettings = await readFromFile()
      return NextResponse.json(
        { success: true, settings: fileSettings, fallback: "file" },
        {
          headers: {
            "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
            "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            "Vary": "*",
          },
        }
      )
    }

    // No admin client: file fallback
    const settings = await readFromFile()
    return NextResponse.json(
      { success: true, settings, fallback: "file" },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
          "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          "Vary": "*",
        },
      }
    )
  } catch (e) {
    console.error("[site-settings] GET error", e)
    const fallback = await readFromFile()
    return NextResponse.json(
      { success: true, settings: fallback, fallback: "file" },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
          "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          "Vary": "*",
        },
      }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const contact_email = (body.contact_email || "").toString().trim()
    const contact_phone = (body.contact_phone || "").toString().trim()
    const about = (body.about || "").toString().trim()
    const location = (body.location || "").toString().trim()
    const social_facebook = (body.social_facebook || "").toString().trim()
    const social_instagram = (body.social_instagram || "").toString().trim()
    const social_youtube = (body.social_youtube || "").toString().trim()
    const social_x = (body.social_x || "").toString().trim()
    const shipping_title = (body.shipping_title || "").toString().trim()
    const shipping_sub = (body.shipping_sub || "").toString().trim()
    const warranty_title = (body.warranty_title || "").toString().trim()
    const warranty_sub = (body.warranty_sub || "").toString().trim()
    const returns_title = (body.returns_title || "").toString().trim()
    const returns_sub = (body.returns_sub || "").toString().trim()
    const hero_title_prefix = (body.hero_title_prefix || "").toString().trim()
    const hero_title_highlight = (body.hero_title_highlight || "").toString().trim()
    const hero_title_suffix = (body.hero_title_suffix || "").toString().trim()
    const hero_subtitle = (body.hero_subtitle || "").toString().trim()
    const hero_stat_primary = (body.hero_stat_primary || "").toString().trim()

    if (!contact_email || !contact_phone) {
      return NextResponse.json({ success: false, message: "ইমেইল এবং ফোন নাম্বার প্রয়োজন" }, { status: 400 })
    }

    const admin = createAdminClient()
    if (admin) {
      // Upsert single row (id=1) pattern
      const payload = { id: 1, contact_email, contact_phone, about, location, social_facebook, social_instagram, social_youtube, social_x, shipping_title, shipping_sub, warranty_title, warranty_sub, returns_title, returns_sub, hero_title_prefix, hero_title_highlight, hero_title_suffix, hero_subtitle, hero_stat_primary, updated_at: new Date().toISOString() }
      const { error } = await admin.from("site_settings").upsert(payload, { onConflict: "id" })
      if (!error) {
        return NextResponse.json({ success: true })
      }
      console.warn("[site-settings] Supabase upsert failed, falling back to file", error)
    }

    // Fallback to file write
    const ok = await writeToFile({ contact_email, contact_phone, about, location, social_facebook, social_instagram, social_youtube, social_x, shipping_title, shipping_sub, warranty_title, warranty_sub, returns_title, returns_sub, hero_title_prefix, hero_title_highlight, hero_title_suffix, hero_subtitle, hero_stat_primary })
    if (ok) return NextResponse.json({ success: true, fallback: "file" })

    return NextResponse.json({ success: false, message: "সেটিংস সংরক্ষণ ব্যর্থ" }, { status: 500 })
  } catch (e) {
    console.error("[site-settings] POST error", e)
    return NextResponse.json({ success: false, message: "সার্ভার ত্রুটি" }, { status: 500 })
  }
}
