"use client"

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Activity, Users, Package, Boxes, Database, HardDrive } from "lucide-react"

type AdminMetricsData = {
  success: boolean
  liveVisitors: number
  db: { products: number; categories: number; orders: number; users: number }
  storage: { buckets: number; filesApprox: number }
  updatedAt: string
}

export default function AdminMetrics() {
  const [data, setData] = useState<AdminMetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [latProducts, setLatProducts] = useState<number[]>([])
  const [latCategories, setLatCategories] = useState<number[]>([])

  const avgProducts = useMemo(() => average(latProducts), [latProducts])
  const avgCategories = useMemo(() => average(latCategories), [latCategories])

  useEffect(() => {
    let cancelled = false

    const loadMetrics = async () => {
      try {
        const res = await fetch("/api/admin/metrics", { cache: "no-store" })
        const json: AdminMetricsData = await res.json()
        if (!cancelled) {
          if (json?.success) {
            setData(json)
            setError(null)
          } else {
            setError("Failed to load metrics")
          }
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setError("Network error")
          setLoading(false)
        }
      }
    }

    const measure = async (url: string, setter: Dispatch<SetStateAction<number[]>>) => {
      try {
        const t0 = performance.now()
        // No-store to force a fresh RTT and avoid cached response skew
        await fetch(`${url}${url.includes("?") ? "&" : "?"}m=1`, { cache: "no-store" })
        const t1 = performance.now()
        const ms = Math.max(0, Math.round(t1 - t0))
        setter((prev: number[]) => clampSeries([...prev.slice(-9), ms]))
      } catch {}
    }

    loadMetrics()
    measure("/api/products", setLatProducts)
    measure("/api/categories", setLatCategories)

    const id = setInterval(() => {
      loadMetrics()
      measure("/api/products", setLatProducts)
      measure("/api/categories", setLatCategories)
    }, 30_000)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const health = useMemo(() => {
    // Simple health heuristic from average latencies
    const apis = [avgProducts, avgCategories].filter((v) => v > 0)
    if (apis.length === 0) return { label: "Unknown", color: "bg-gray-400" }
    const avg = apis.reduce((a, b) => a + b, 0) / apis.length
    if (avg <= 300) return { label: "Excellent", color: "bg-emerald-500" }
    if (avg <= 800) return { label: "Good", color: "bg-amber-500" }
    return { label: "Degraded", color: "bg-red-500" }
  }, [avgProducts, avgCategories])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" /> Live Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center text-sm text-gray-600"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading metrics...</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : data ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Live Visitors (5m)</div>
                <div className="text-lg font-semibold">{data.liveVisitors}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">System Health</div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-16 rounded ${health.color}`} />
                  <Badge variant="secondary" className="text-xs">{health.label}</Badge>
                </div>
              </div>
              <div className="text-[11px] text-gray-500">Updated {formatTimeAgo(data.updatedAt)}</div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" /> Database</CardTitle>
        </CardHeader>
        <CardContent>
          {data ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <MetricPill icon={<Package className="h-3.5 w-3.5" />} label="Products" value={data.db.products} />
              <MetricPill icon={<Boxes className="h-3.5 w-3.5" />} label="Categories" value={data.db.categories} />
              <MetricPill icon={<Users className="h-3.5 w-3.5" />} label="Users" value={data.db.users} />
              <MetricPill icon={<Activity className="h-3.5 w-3.5" />} label="Orders" value={data.db.orders} />
            </div>
          ) : (
            <div className="text-xs text-gray-500">No data</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><HardDrive className="h-4 w-4" /> Storage</CardTitle>
        </CardHeader>
        <CardContent>
          {data ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Buckets</span>
                <strong>{data.storage.buckets}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Files (approx)</span>
                <strong>{data.storage.filesApprox}</strong>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">No data</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">API Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <LatencyRow label="/api/products" series={latProducts} avg={avgProducts} />
          <LatencyRow label="/api/categories" series={latCategories} avg={avgCategories} />
        </CardContent>
      </Card>
    </div>
  )
}

function MetricPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-2.5 py-1.5">
      <div className="flex items-center gap-2 text-gray-700">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}

function LatencyRow({ label, series, avg }: { label: string; series: number[]; avg: number }) {
  const color = avg <= 300 ? "bg-emerald-500" : avg <= 800 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span>{avg > 0 ? `${avg}ms` : "--"}</span>
      </div>
      <div className="flex items-end gap-1 h-10">
        {series.length > 0 ? (
          series.map((v, i) => (
            <div key={i} className={`w-2 rounded-sm ${barColor(v)} ${i === series.length - 1 ? color : ""}`} style={{ height: `${scaleBar(v)}%` }} />
          ))
        ) : (
          <div className="text-[11px] text-gray-400">No samples yet</div>
        )}
      </div>
    </div>
  )
}

function average(arr: number[]) {
  if (!arr || arr.length === 0) return 0
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
}

function scaleBar(ms: number) {
  // Map 0..1500ms to 10..100%
  const h = Math.max(10, Math.min(100, (ms / 1500) * 100))
  return h
}

function barColor(ms: number) {
  if (ms <= 300) return "bg-emerald-400"
  if (ms <= 800) return "bg-amber-400"
  return "bg-red-400"
}

function clampSeries(arr: number[]) {
  return arr.slice(-10)
}

function formatTimeAgo(iso: string) {
  try {
    const ts = new Date(iso).getTime()
    const diff = Math.max(0, Date.now() - ts)
    if (diff < 60_000) return `${Math.round(diff / 1000)}s ago`
    if (diff < 3_600_000) return `${Math.round(diff / 60000)}m ago`
    return `${Math.round(diff / 3_600_000)}h ago`
  } catch {
    return iso
  }
}
