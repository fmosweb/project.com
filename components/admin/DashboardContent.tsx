"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  ShoppingCart, 
  Settings, 
  LogOut, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Plus, 
  Tag,
  Search,
  Package,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Image as ImageIcon
} from "lucide-react"
import type { Product } from "@/lib/services/admin"
import AdminMetrics from "@/components/admin/admin-metrics"

// DashboardContent component
export default function DashboardContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isClient, setIsClient] = useState(false)

  // Removed: hero image control from dashboard (moved to /admin/images)

  useEffect(() => {
    setIsClient(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const ts = Date.now()

      // Fetch products using API endpoint (no cache)
      const productsResponse = await fetch(`/api/admin/products?ts=${ts}` as any, { cache: 'no-store' })
      const productsData = await productsResponse.json()
      
      if (productsData.success && productsData.products) {
        console.log("[v1] Products loaded:", productsData.products.length)
        setProducts(productsData.products)
      } else {
        console.error("[v1] Products error:", productsData.message)
        setError(productsData.message || "Failed to load products")
        setProducts([])
      }

      // Fetch dashboard stats using API endpoint (no cache)
      const statsResponse = await fetch(`/api/admin/dashboard?ts=${ts}` as any, { cache: 'no-store' })
      const statsData = await statsResponse.json()
      
      if (statsData.success && statsData.data) {
        console.log("[v1] Stats loaded:", statsData.data)
        setDashboardStats(statsData.data)
      } else {
        console.error("[v1] Stats error:", statsData.error)
        // Set default values if stats fail
        setDashboardStats({
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: productsData.products?.length || 0,
          totalUsers: 0
        })
      }
    } catch (error) {
      console.error("[v1] Network error:", error)
      setError("Network connection failed")
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // (Image management moved to /admin/images)

  const handleDeleteProduct = async (productId: string | number) => {
    if (!confirm("আপনি কি নিশ্চিত এই পণ্যটি মুছতে চান?")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE', cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.success) {
        alert("পণ্য সফলভাবে মুছে ফেলা হয়েছে")
        fetchData()
      } else {
        console.error("[v1] Delete failed:", { status: res.status, data })
        alert(`পণ্য মুছতে ব্যর্থ${data?.message ? `: ${data.message}` : ''}`)
      }
    } catch (error) {
      console.error("[v1] Delete error:", error)
      alert("পণ্য মুছতে ব্যর্থ")
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string | boolean) => {
    if (status === true || status === "সক্রিয়") return "bg-green-100 text-green-800"
    if (status === false || status === "নিষ্ক্রিয়") return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  const getProductStatus = (product: any) => {
    if (product?.stock === 0 || product?.stock_quantity === 0) return "স্টক শেষ"
    if (product?.is_active === false) return "নিষ্ক্রিয়"
    return "সক্রিয়"
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Admin Dashboard Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-500">সমাধানের উপায়:</p>
            <p className="text-sm text-gray-500">১. পেজ রিফ্রেশ করুন</p>
            <p className="text-sm text-gray-500">২. ইন্টারনেট কানেকশন চেক করুন</p>
            <p className="text-sm text-gray-500">৩. আবার লগইন করুন</p>
          </div>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()} className="bg-amber-600 hover:bg-amber-700">
              পেজ রিফ্রেশ করুন
            </Button>
            <Button onClick={() => (window.location.href = "/admin/login")} variant="outline">
              আবার লগইন করুন
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Only render the UI after client-side hydration is complete
  // This prevents hydration mismatches by ensuring the client-side rendered content
  // matches what was rendered on the server
  if (!isClient) {
    return <div suppressHydrationWarning className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div suppressHydrationWarning className="animate-pulse flex items-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading...</span>
      </div>
    </div>
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-white">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-amber-100/60 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent tracking-tight">
                FMOSWEB অ্যাডমিন
              </Link>
              <Badge className="bg-amber-100 text-amber-800">ড্যাশবোর্ড</Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchData}
                disabled={isLoading}
                title="ডেটা রিফ্রেশ করুন"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                রিফ্রেশ
              </Button>
              <Link href="/admin/products">
                <Button variant="ghost" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  পণ্য ব্যবস্থাপনা
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  অর্ডার ম্যানেজ
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  সেটিংস
                </Button>
              </Link>
              <Link href="/admin/images">
                <Button variant="ghost" size="sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  ইমেজ ম্যানেজমেন্ট
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={async () => {
                  try {
                    await fetch('/api/admin/logout', { method: 'POST' })
                  } catch {}
                  window.location.href = "/admin/login"
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                লগআউট
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div className="lg:col-span-3 xl:col-span-4">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden group border border-amber-100/60 rounded-2xl bg-white/90 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <CardContent className="p-6">
              <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full corner-glow" aria-hidden />
              <div className="h-1 w-16 bg-gradient-to-r from-amber-500/60 to-orange-500/60 rounded-full mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">মোট আয়</p>
                  <p className="text-2xl font-bold text-gray-900">TK{dashboardStats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group border border-amber-100/60 rounded-2xl bg-white/90 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <CardContent className="p-6">
              <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full corner-glow" aria-hidden />
              <div className="h-1 w-16 bg-gradient-to-r from-blue-500/30 to-blue-400/30 rounded-full mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">মোট অর্ডার</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group border border-amber-100/60 rounded-2xl bg-white/90 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <CardContent className="p-6">
              <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full corner-glow" aria-hidden />
              <div className="h-1 w-16 bg-gradient-to-r from-purple-500/30 to-purple-400/30 rounded-full mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">মোট পণ্য</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalProducts}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group border border-amber-100/60 rounded-2xl bg-white/90 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <CardContent className="p-6">
              <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full corner-glow" aria-hidden />
              <div className="h-1 w-16 bg-gradient-to-r from-amber-500/40 to-orange-500/40 rounded-full mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">মোট ব্যবহারকারী</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/orders">
            <Card className="relative group hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer border border-amber-100/60 rounded-2xl bg-white/90">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full ring-breath">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">অর্ডার ম্যানেজমেন্ট</h3>
                    <p className="text-sm text-gray-600">অর্ডার দেখুন, কনফার্ম করুন, ক্যানসেল করুন</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/admin/users">
            <Card className="relative group hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer border border-amber-100/60 rounded-2xl bg-white/90">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-full ring-breath">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">ইউজার ম্যানেজমেন্ট</h3>
                    <p className="text-sm text-gray-600">কাস্টমার ডেটা দেখুন এবং ম্যানেজ করুন</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/products">
            <Card className="relative group hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer border border-amber-100/60 rounded-2xl bg-white/90">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-full ring-breath">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">পণ্য ব্যবস্থাপনা</h3>
                    <p className="text-sm text-gray-600">সব পণ্য দেখুন এবং পরিচালনা করুন</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/admin/categories" className="md:col-start-3 md:row-start-1">
            <Card className="relative group hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer border border-amber-100/60 rounded-2xl bg-white/90">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-100 rounded-full ring-breath">
                    <Tag className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">ক্যাটাগরি ম্যানেজমেন্ট</h3>
                    <p className="text-sm text-gray-600">ক্যাটাগরি যোগ করুন, মুছুন এবং ম্যানেজ করুন</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>


        {/* Products Management */}
        <Card className="border border-amber-100/60 rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>পণ্য ব্যবস্থাপনা</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="পণ্য খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 md:w-80"
                />
              </div>
              <Link href="/admin/products/add">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  পণ্য যোগ করুন
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p>পণ্য লোড হচ্ছে...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-xl hover:border-amber-200/70 shadow-sm hover:shadow-md transition-all bg-white/80">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={product.images?.[0] || product.image_url || "/placeholder.svg"}
                          alt={product.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-balance">{product.name || "Unknown Product"}</p>
                        <p className="text-sm text-gray-600">{product.category || "Uncategorized"}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="font-bold">TK{product.price || 0}</span>
                          <span className="text-sm text-gray-600">স্টক: {product.stock || product.stock_quantity || 0}</span>
                          <Badge className={getStatusColor(getProductStatus(product))}>
                            {getProductStatus(product)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">কোন পণ্য পাওয়া যায়নি</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
          </div>
          {/* Right sidebar metrics */}
          <aside className="lg:col-span-1 lg:sticky lg:top-6 h-max space-y-4">
            <AdminMetrics />
          </aside>
        </div>
      </main>
    </div>
  )
}