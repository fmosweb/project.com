"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Tag,
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { getCategories, createCategory, deleteCategory } from "@/lib/services/admin"
import AdminMetrics from "@/components/admin/admin-metrics"
import AdminLayout from "@/components/admin/admin-layout"

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    icon: "Tag",
    image_url: "/placeholder.svg",
    color: "bg-gray-500",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  // Use a ref to track if component is mounted to avoid state updates during render
  const [isClient, setIsClient] = useState(false)
  
  // This effect runs once on mount to indicate we're on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    console.log("[v1] Categories management page mounted, loading data")
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      console.log("[v1] Starting fetchCategories")
      setError(null)
      setIsLoading(true)

      // Fetch categories using admin service
      const response = await fetch("/api/admin/categories")
      const result = await response.json()
      
      if (!result.success) {
        console.error("[v1] Categories error:", result.error)
        setError(result.error || "Failed to load categories")
        setCategories([])
      } else {
        console.log("[v1] Categories loaded:", result.categories.length)
        setCategories(result.categories)
      }
    } catch (error) {
      console.error("[v1] Network error:", error)
      setError("Network connection failed")
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCategory.name || !newCategory.description) {
      alert("নাম এবং বিবরণ অবশ্যই দিতে হবে")
      return
    }

    try {
      setIsLoading(true)
      // Prepare image URL (upload if a file is provided)
      let imageUrl = newCategory.image_url
      let uploadErrMsg: string | null = null
      if (imageFile) {
        try {
          setUploadingImage(true)
          const fd = new FormData()
          fd.append('file', imageFile)
          const upRes = await fetch('/api/admin/uploads/category', { method: 'POST', body: fd })
          const upJson = await upRes.json()
          if (upRes.ok && upJson?.success && upJson?.url) {
            imageUrl = upJson.url as string
          } else {
            uploadErrMsg = (upJson?.message || upJson?.error || `Upload failed (status ${upRes.status})`)
            console.error('[v1] Category image upload failed:', uploadErrMsg, upJson)
          }
        } catch (upErr) {
          uploadErrMsg = (upErr instanceof Error ? upErr.message : String(upErr))
          console.error('[v1] Unexpected upload error:', upErr)
        } finally {
          setUploadingImage(false)
        }
      }

      // If user selected an image file but upload failed to produce a public URL, stop and show message
      if (imageFile && (!imageUrl || imageUrl === "/placeholder.svg")) {
        alert(`ছবি আপলোড হয়নি। ${uploadErrMsg ? "কারণ: " + uploadErrMsg : "অনুগ্রহ করে আবার চেষ্টা করুন বা স্টোরেজ কনফিগারেশন চেক করুন।"}`)
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newCategory, image_url: imageUrl }),
      })

      const result = await response.json()

      if (result.success) {
        alert("ক্যাটাগরি সফলভাবে যোগ করা হয়েছে")
        setNewCategory({
          name: "",
          description: "",
          icon: "Tag",
          image_url: "/placeholder.svg",
          color: "bg-gray-500",
        })
        setImageFile(null)
        setImagePreview(null)
        setIsAddingCategory(false)
        fetchCategories()
      } else {
        alert(`ক্যাটাগরি যোগ করতে ব্যর্থ: ${result.error || "অজানা ত্রুটি"}`)
      }
    } catch (error) {
      console.error("[v1] Add category error:", error)
      alert("ক্যাটাগরি যোগ করতে ব্যর্থ")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই ক্যাটাগরি মুছতে চান?")) {
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        alert("ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে")
        fetchCategories()
      } else {
        alert(`ক্যাটাগরি মুছতে ব্যর্থ: ${result.error || "অজানা ত্রুটি"}`)
      }
    } catch (error) {
      console.error("[v1] Delete category error:", error)
      alert("ক্যাটাগরি মুছতে ব্যর্থ")
    } finally {
      setIsLoading(false)
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">ক্যাটাগরি ম্যানেজমেন্ট এরর</h1>
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

  return (
    <AdminLayout title="ক্যাটাগরি ম্যানেজমেন্ট" showMetrics={false}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <Button 
            onClick={() => setIsAddingCategory(!isAddingCategory)}
            className="bg-amber-600 hover:bg-amber-700 btn-pulse-glow btn-shine"
          >
            {isAddingCategory ? (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                বাতিল করুন
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                নতুন ক্যাটাগরি যোগ করুন
              </>
            )}
          </Button>
        </div>
        {isAddingCategory ? (
          <Card className="relative overflow-hidden mb-8 rounded-2xl border border-amber-100/60 bg-white/90 hover:shadow-lg transition-all animate-fade-up">
            <CardHeader>
              <CardTitle>নতুন ক্যাটাগরি যোগ করুন</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    ক্যাটাগরি নাম *
                  </label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="ক্যাটাগরি নাম লিখুন"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    বিবরণ *
                  </label>
                  <Textarea
                    id="description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="ক্যাটাগরি বিবরণ লিখুন"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ক্যাটাগরি ইমেজ
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded bg-gray-100 border flex items-center justify-center overflow-hidden">
                      <img
                        src={imagePreview || newCategory.image_url || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setImageFile(file)
                          setImagePreview(file ? URL.createObjectURL(file) : null)
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Square image recommended. JPG/PNG under 1MB.</p>
                      {uploadingImage && (
                        <p className="text-xs text-amber-600 mt-1">ছবি আপলোড হচ্ছে...</p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    রঙ
                  </label>
                  <select
                    id="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="bg-gray-500">ধূসর</option>
                    <option value="bg-red-500">লাল</option>
                    <option value="bg-amber-500">হলুদ</option>
                    <option value="bg-green-500">সবুজ</option>
                    <option value="bg-blue-500">নীল</option>
                    <option value="bg-purple-500">বেগুনি</option>
                    <option value="bg-pink-500">গোলাপী</option>
                  </select>
                </div>
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="bg-amber-600 hover:bg-amber-700 w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        অপেক্ষা করুন...
                      </>
                    ) : (
                      <>সাবমিট করুন</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {isLoading && !isAddingCategory ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-2">লোড হচ্ছে...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Card key={category.id} className="relative overflow-hidden group border border-amber-100/60 rounded-2xl bg-white/90 hover:shadow-xl hover:-translate-y-0.5 transition-all animate-fade-up">
                  <div className={`h-2 ${category.color || 'bg-gray-500'}`}></div>
                  <CardContent className="p-6">
                    <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full corner-glow" aria-hidden />
                    {/* Category Image */}
                    <div className="w-full h-36 rounded-lg overflow-hidden mb-4 bg-gray-100">
                      <img
                        src={category.image_url || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                      </div>
                      <div className="p-2 rounded-full bg-amber-50 ring-breath">
                        <Tag className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        মুছুন
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-amber-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">কোন ক্যাটাগরি পাওয়া যায়নি</h3>
                <p className="text-gray-600 mb-6">এখনও কোন ক্যাটাগরি যোগ করা হয়নি। উপরের বাটন ব্যবহার করে নতুন ক্যাটাগরি যোগ করুন।</p>
                <Button 
                  onClick={() => setIsAddingCategory(true)}
                  className="bg-amber-600 hover:bg-amber-700 btn-cta-animated"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন ক্যাটাগরি যোগ করুন
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}