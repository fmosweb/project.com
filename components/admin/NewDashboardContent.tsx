"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react"
import AdminLayout from "./admin-layout"
import { DonutChart, StatsCard, MultiLineChart } from "./admin-charts"

export default function NewDashboardContent() {
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<{ label: string; users: number; sales: number }[]>([])
  const [usage, setUsage] = useState<{ dbMB: number | null; storageMB: number }>(() => ({ dbMB: null, storageMB: 0 }))
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [pendingLoading, setPendingLoading] = useState<boolean>(true)
  const [invoices, setInvoices] = useState<any[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState<boolean>(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/admin/dashboard', { cache: 'no-store' })
        const json = await res.json()
        if (cancelled) return
        if (json?.success && json?.data) {
          const d = json.data
          setDashboardStats({
            totalRevenue: Number(d.totalRevenue) || 0,
            totalOrders: Number(d.totalOrdersAll ?? d.totalOrders) || 0,
            totalProducts: Number(d.totalProducts) || 0,
            totalUsers: Number(d.totalUsers) || 0,
          })
          setError(null)
        } else {
          setError('ডেটা লোড করতে সমস্যা হয়েছে')
        }
      } catch (e) {
        if (!cancelled) setError('নেটওয়ার্ক ত্রুটি')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  // Load recent online payment invoices
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setInvoicesLoading(true)
        const res = await fetch('/api/admin/invoices?limit=5', { cache: 'no-store' })
        const json = await res.json()
        if (cancelled) return
        if (json?.success && Array.isArray(json?.data)) {
          setInvoices(json.data)
        } else {
          setInvoices([])
        }
      } catch {
        if (!cancelled) setInvoices([])
      } finally {
        if (!cancelled) setInvoicesLoading(false)
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  // Load recent pending (unconfirmed) orders
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setPendingLoading(true)
        const res = await fetch('/api/admin/orders?status=pending&limit=5&page=1', { cache: 'no-store' })
        const json = await res.json()
        if (cancelled) return
        if (json?.success && Array.isArray(json?.data)) {
          setPendingOrders(json.data)
        } else {
          setPendingOrders([])
        }
      } catch {
        if (!cancelled) setPendingOrders([])
      } finally {
        if (!cancelled) setPendingLoading(false)
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  // Load Supabase usage (DB MB + Storage MB)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/admin/usage', { cache: 'no-store' })
        const json = await res.json()
        if (cancelled) return
        const dbMB = Number(json?.database?.mb)
        const storageMB = Number(json?.storage?.mb)
        setUsage({
          dbMB: Number.isFinite(dbMB) ? dbMB : null,
          storageMB: Number.isFinite(storageMB) ? storageMB : 0,
        })
      } catch {
        if (!cancelled) setUsage({ dbMB: null, storageMB: 0 })
      }
    }
    load()
    const id = setInterval(load, 60_000 * 5)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  // Load analytics for Users vs Sales (last 12 months)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/admin/analytics', { cache: 'no-store' })
        const json = await res.json()
        if (cancelled) return
        if (json?.success && Array.isArray(json?.months)) {
          setAnalytics(json.months as { label: string; users: number; sales: number }[])
        } else {
          setAnalytics([])
        }
      } catch {
        if (!cancelled) setAnalytics([])
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  // Usage donut data is derived from API
  // line chart data removed; using multi-series analytics instead

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="মোট আয়"
            value={`৳${(dashboardStats.totalRevenue || 0).toLocaleString()}`}
            trend={undefined}
            icon={<DollarSign className="h-5 w-5 text-green-600" />}
            color="green"
          />
          <StatsCard
            title="মোট ইউজার"
            value={(dashboardStats.totalUsers || 0).toLocaleString()}
            trend={undefined}
            icon={<Users className="h-5 w-5 text-amber-600" />}
            color="amber"
          />
          <StatsCard
            title="মোট অর্ডার"
            value={(dashboardStats.totalOrders || 0).toLocaleString()}
            trend={undefined}
            icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
            color="blue"
          />
          <StatsCard
            title="মোট পণ্য"
            value={(dashboardStats.totalProducts || 0).toLocaleString()}
            trend={undefined}
            icon={<Package className="h-5 w-5 text-purple-600" />}
            color="purple"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Database Usage Donut */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">ডাটাবেস ব্যবহার (MB)</CardTitle>
            </CardHeader>
            <CardContent>
              {usage.dbMB !== null ? (
                <>
                  <DonutChart 
                    data={[{ label: "Database", value: usage.dbMB, color: "#f59e0b" }]} 
                    total={String(usage.dbMB.toLocaleString())} 
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                        <span className="text-gray-600">Database (MB)</span>
                      </div>
                      <span className="font-medium">{usage.dbMB.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="h-[200px] animate-pulse bg-gray-100 rounded" />
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">ইউজার বনাম বিক্রি (১২ মাস)</CardTitle>
              <p className="text-xs text-gray-500">ওয়েবসাইটের ইউজার এবং সেলস ট্রেন্ড</p>
            </CardHeader>
            <CardContent>
              {analytics.length > 0 ? (
                <MultiLineChart data={analytics} />
              ) : (
                <div className="h-[200px] animate-pulse bg-gray-100 rounded" />
              )}
              <div className="mt-4 flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">ইউজার</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-gray-600">বিক্রি</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Countries & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending (Unconfirmed) Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">নতুন মুলতুবি অর্ডার</CardTitle>
              <Link href="/admin/orders?status=pending" className="text-xs">
                <Button variant="ghost" size="sm" className="text-xs">সব দেখুন</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="space-y-3">
                  <div className="h-10 bg-gray-100 rounded animate-pulse" />
                  <div className="h-10 bg-gray-100 rounded animate-pulse" />
                  <div className="h-10 bg-gray-100 rounded animate-pulse" />
                </div>
              ) : pendingOrders.length === 0 ? (
                <p className="text-sm text-gray-500">কোনো মুলতুবি অর্ডার নেই</p>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.map((ord: any) => (
                    <div key={ord.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                          ORD
                        </div>
                        <div>
                          <p className="font-medium text-sm">{ord.orderNumber || `ORD-${String(ord.id).slice(0,8).toUpperCase()}`}</p>
                          <p className="text-xs text-gray-500">{ord.userName || ord.userEmail || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">৳{Number(ord.total || 0).toLocaleString()}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">{String(ord.status || '').toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Invoice (Online Payments) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">নতুন অনলাইন পেমেন্ট</CardTitle>
              <Link href="/admin/orders" className="text-xs">
                <Button variant="ghost" size="sm" className="text-xs">সব দেখুন</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-gray-100 rounded animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded animate-pulse" />
                </div>
              ) : invoices.length === 0 ? (
                <p className="text-sm text-gray-500">কোনো অনলাইন পেমেন্ট নেই</p>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">৳</div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate" title={inv.product_summary}>{inv.product_summary}</p>
                          <p className="text-xs text-gray-500 truncate" title={`${inv?.user?.name || '-'} · ${inv?.user?.phone || '-'}`}>
                            {inv?.user?.name || '-'} · {inv?.user?.phone || '-'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">৳{Number(inv.amount || 0).toLocaleString()}</p>
                        <span className="text-[11px] text-gray-500">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
