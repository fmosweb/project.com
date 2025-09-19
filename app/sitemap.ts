import type { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ]

  try {
    const res = await fetch(`${base}/api/admin/products`, { next: { revalidate: 3600 } })
    if (!res.ok) return staticRoutes
    const json = await res.json().catch(() => ({}))
    const list: any[] = Array.isArray(json?.products) ? json.products : []

    const productRoutes: MetadataRoute.Sitemap = list.map((p: any) => ({
      url: `${base}/products/${encodeURIComponent(p?.id ?? "")}`,
      lastModified: p?.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }))

    return [...staticRoutes, ...productRoutes]
  } catch {
    return staticRoutes
  }
}
