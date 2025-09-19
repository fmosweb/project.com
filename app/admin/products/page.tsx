"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  TrendingUp,
  Users,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price?: number
  category: string
  brand?: string
  stock: number
  sku?: string
  is_active: boolean
  is_featured: boolean
  tags: string[]
  features: string[]
  images: string[]
  image_url?: string
  created_at: string
  updated_at: string
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    outOfStock: 0
  })

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        console.log("🛍️ [ADMIN] Fetching products...")
        
        const response = await fetch("/api/admin/products")
        const data = await response.json()
        
        console.log("🛍️ [ADMIN] Products API response:", data)
        
        if (data.success && data.products) {
          setProducts(data.products)
          setFilteredProducts(data.products)
          
          // Calculate stats
          const totalProducts = data.products.length
          const activeProducts = data.products.filter((p: Product) => p.is_active).length
          const featuredProducts = data.products.filter((p: Product) => p.is_featured).length
          const outOfStock = data.products.filter((p: Product) => p.stock <= 0).length
          
          setStats({
            totalProducts,
            activeProducts,
            featuredProducts,
            outOfStock
          })
          
          console.log("🛍️ [ADMIN] Products loaded successfully:", {
            total: totalProducts,
            active: activeProducts,
            featured: featuredProducts,
            outOfStock: outOfStock
          })
        } else {
          console.error("🛍️ [ADMIN] Failed to load products:", data.message)
        }
      } catch (error) {
        console.error("🛍️ [ADMIN] Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("আপনি কি এই পণ্যটি মুছে ফেলতে চান?")) {
      return
    }

    try {
      console.log("🗑️ [ADMIN] Deleting product:", productId)
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        cache: 'no-store'
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log("🗑️ [ADMIN] Product deleted successfully")
        // Refresh products list
        setProducts(products.filter(p => p.id !== productId))
        setFilteredProducts(filteredProducts.filter(p => p.id !== productId))
      } else {
        console.error("🗑️ [ADMIN] Failed to delete product:", data.message)
        alert("পণ্য মুছে ফেলতে ব্যর্থ: " + data.message)
      }
    } catch (error) {
      console.error("🗑️ [ADMIN] Error deleting product:", error)
      alert("পণ্য মুছে ফেলতে সমস্যা হয়েছে")
    }
  }

  const formatPrice = (price: number) => {
    const num = new Intl.NumberFormat('bn-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
    return `TK${num}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">পণ্য লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">পণ্য ব্যবস্থাপনা</h1>
          <p className="text-gray-600 mt-1">আপনার সব পণ্য দেখুন এবং পরিচালনা করুন</p>
        </div>
        <Link href="/admin/products/add">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            নতুন পণ্য যোগ করুন
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সক্রিয় পণ্য</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">বৈশিষ্ট্যপূর্ণ পণ্য</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.featuredProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">স্টক শেষ</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>পণ্য অনুসন্ধান</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="পণ্যের নাম, ক্যাটাগরি, ব্র্যান্ড বা SKU দিয়ে অনুসন্ধান করুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>পণ্যের তালিকা ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "আপনার অনুসন্ধানের সাথে মিলে যাওয়া কোনো পণ্য নেই" : "এখনও কোনো পণ্য যোগ করা হয়নি"}
              </p>
              {!searchTerm && (
                <Link href="/admin/products/add">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    প্রথম পণ্য যোগ করুন
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>পণ্য</TableHead>
                    <TableHead>ক্যাটাগরি</TableHead>
                    <TableHead>মূল্য</TableHead>
                    <TableHead>স্টক</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead className="text-right">কর্ম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image_url || product.images?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatPrice(product.price)}</div>
                          {product.original_price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.original_price)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                          {product.stock} টি
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </Badge>
                          {product.is_featured && (
                            <Badge variant="outline">বৈশিষ্ট্যপূর্ণ</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(product.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/products/${product.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              দেখুন
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/products/edit/${product.id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              সম্পাদনা
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              মুছে ফেলুন
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
