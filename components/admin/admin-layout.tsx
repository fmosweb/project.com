"use client"

import { ReactNode, useEffect, useState } from "react"
import AdminSidebar from "./admin-sidebar"
import AdminMetrics from "./admin-metrics"
import { Bell, Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  showMetrics?: boolean
}

export default function AdminLayout({ children, title = "Dashboard", showMetrics = true }: AdminLayoutProps) {
  const [stockAlerts, setStockAlerts] = useState<Array<{ id: string; name: string; stock: number; image?: string; updated_at?: string }>>([])
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/admin/stock-alerts', { cache: 'no-store' })
        const json = await res.json()
        if (cancelled) return
        if (json?.success && Array.isArray(json?.items)) {
          setStockAlerts(json.items)
        } else {
          setStockAlerts([])
        }
      } catch {
        if (!cancelled) setStockAlerts([])
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  type="search" 
                  placeholder="Search..." 
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setNotifOpen((v) => !v)}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {stockAlerts.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center font-semibold">
                      {stockAlerts.length}
                    </span>
                  )}
                </Button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b flex items-center justify-between">
                      <div className="text-sm font-semibold">স্টক আউট নোটিফিকেশন</div>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => setNotifOpen(false)}>Close</Button>
                    </div>
                    <div className="max-h-80 overflow-auto">
                      {stockAlerts.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">কোনো স্টক আউট নোটিফিকেশন নেই</div>
                      ) : (
                        <ul className="divide-y">
                          {stockAlerts.map((p) => (
                            <li key={p.id} className="p-3 flex items-center gap-3 hover:bg-gray-50">
                              <div className="w-10 h-10 rounded border overflow-hidden bg-white flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.image || '/placeholder.svg'} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium truncate">{p.name}</div>
                                <div className="text-xs text-red-600">স্টক: {Number(p.stock || 0)} (Out of stock)</div>
                              </div>
                              <Link href={`/admin/products`} className="text-xs text-blue-600 hover:underline whitespace-nowrap">Manage</Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="p-3 border-t flex justify-between items-center">
                      <Link href="/admin/products" className="text-xs text-blue-600 hover:underline">সব পণ্য দেখুন</Link>
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => setNotifOpen(false)}>ঠিক আছে</Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 pl-4 border-l">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Admin</p>
                  <p className="text-gray-500 text-xs">Administrator</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            <div className={`${showMetrics ? 'grid grid-cols-1 xl:grid-cols-[1fr_320px]' : ''}`}>
              <main className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
                {children}
              </main>
              
              {showMetrics && (
                <aside className="border-l border-gray-200 bg-white p-6 overflow-y-auto">
                  <AdminMetrics />
                </aside>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
