"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"

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
  weight?: number
  dimensions?: string
  is_active: boolean
  is_featured: boolean
  tags: string[]
  features: string[]
  images: string[]
  image_url?: string
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    brand: "",
    stock: "",
    sku: "",
    weight: "",
    dimensions: "",
    isActive: true,
    isFeatured: false,
    tags: "",
    features: "",
    imageUrl: ""
  })

  // Fetch product and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch product
        const productResponse = await fetch(`/api/admin/products/${productId}`)
        const productData = await productResponse.json()
        
        if (productData.success && productData.product) {
          setProduct(productData.product)
          setFormData({
            name: productData.product.name || "",
            description: productData.product.description || "",
            price: productData.product.price?.toString() || "",
            originalPrice: productData.product.original_price?.toString() || "",
            category: productData.product.category || "",
            brand: productData.product.brand || "",
            stock: productData.product.stock?.toString() || "",
            sku: productData.product.sku || "",
            weight: productData.product.weight?.toString() || "",
            dimensions: productData.product.dimensions || "",
            isActive: productData.product.is_active !== false,
            isFeatured: productData.product.is_featured || false,
            tags: productData.product.tags?.join(", ") || "",
            features: productData.product.features?.join(", ") || "",
            imageUrl: productData.product.image_url || productData.product.images?.[0] || ""
          })
        } else {
          setError("পণ্য খুঁজে পাওয়া যায়নি")
        }

        // Fetch categories
        const categoriesResponse = await fetch("/api/admin/categories")
        const categoriesData = await categoriesResponse.json()
        
        if (categoriesData.success && categoriesData.categories) {
          setCategories(categoriesData.categories)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("ডেটা লোড করতে সমস্যা হয়েছে")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchData()
    }
  }, [productId])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        category: formData.category,
        brand: formData.brand || null,
        stock: parseInt(formData.stock) || 0,
        sku: formData.sku || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions || null,
        is_active: formData.isActive,
        is_featured: formData.isFeatured,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        features: formData.features ? formData.features.split(',').map(feature => feature.trim()) : [],
        images: formData.imageUrl ? [formData.imageUrl] : [],
        image_url: formData.imageUrl
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productData)
      })

      const data = await response.json()

      if (data.success) {
        alert("পণ্য সফলভাবে আপডেট করা হয়েছে")
        router.push("/admin/products")
      } else {
        setError(data.message || "পণ্য আপডেট করতে ব্যর্থ")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      setError("পণ্য আপডেট করতে সমস্যা হয়েছে")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">পণ্য লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">ত্রুটি</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/admin/products">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              পণ্য তালিকায় ফিরে যান
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ফিরে যান
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">পণ্য সম্পাদনা</h1>
            <p className="text-gray-600 mt-1">{product?.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>মূল তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">পণ্যের নাম *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="পণ্যের নাম লিখুন"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">বিবরণ *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="পণ্যের বিবরণ লিখুন"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">ক্যাটাগরি *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brand">ব্র্যান্ড</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  placeholder="ব্র্যান্ডের নাম"
                />
              </div>

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="পণ্যের SKU"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card>
            <CardHeader>
              <CardTitle>মূল্য ও স্টক</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="price">মূল্য *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="originalPrice">আসল মূল্য</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="stock">স্টক পরিমাণ *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="weight">ওজন (কেজি)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="dimensions">মাত্রা</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange("dimensions", e.target.value)}
                  placeholder="দৈর্ঘ্য x প্রস্থ x উচ্চতা"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>ছবি ও সেটিংস</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">ছবির URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
                <Label htmlFor="isActive">সক্রিয়</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
                />
                <Label htmlFor="isFeatured">বৈশিষ্ট্যপূর্ণ</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="tags">ট্যাগ (কমা দিয়ে আলাদা করুন)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
                placeholder="ট্যাগ ১, ট্যাগ ২, ট্যাগ ৩"
              />
            </div>

            <div>
              <Label htmlFor="features">বৈশিষ্ট্য (কমা দিয়ে আলাদা করুন)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => handleInputChange("features", e.target.value)}
                placeholder="বৈশিষ্ট্য ১, বৈশিষ্ট্য ২, বৈশিষ্ট্য ৩"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              বাতিল
            </Button>
          </Link>
          <Button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                সংরক্ষণ হচ্ছে...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                সংরক্ষণ করুন
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
