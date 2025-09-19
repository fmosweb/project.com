"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, ShoppingCart, Share2, Minus, Plus, Truck, Shield, RotateCcw, X } from "lucide-react"
import { getProductById, type Product } from "@/lib/services/products-client"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/hooks/use-toast"
import type React from "react"

// Mock product data for fallback
const mockProductData = {
  1: {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviews: 124,
    images: [
      "/premium-wireless-headphones.png",
      "/premium-wireless-headphones.png",
      "/premium-wireless-headphones.png",
    ],
    category: "Electronics",
    brand: "AudioTech",
    inStock: true,
    stockCount: 15,
    badge: "Best Seller",
    description:
      "Experience premium audio quality with our flagship wireless headphones. Featuring advanced noise cancellation, 30-hour battery life, and premium materials for ultimate comfort.",
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Premium leather ear cups",
      "Bluetooth 5.0 connectivity",
      "Quick charge - 5 min for 2 hours",
      "Built-in voice assistant",
    ],
    specifications: {
      "Driver Size": "40mm",
      "Frequency Response": "20Hz - 20kHz",
      Impedance: "32 ohms",
      Weight: "250g",
      Connectivity: "Bluetooth 5.0, 3.5mm jack",
      Battery: "30 hours playback",
    },
  },
  2: {
    id: 2,
    name: "Smart Fitness Watch",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.9,
    reviews: 89,
    images: ["/smart-fitness-watch.png", "/smart-fitness-watch.png", "/smart-fitness-watch.png"],
    category: "Electronics",
    brand: "FitTech",
    inStock: true,
    stockCount: 12,
    badge: "New",
    description:
      "Advanced fitness tracking with heart rate monitoring, GPS, and 7-day battery life. Perfect companion for your active lifestyle with comprehensive health insights.",
    features: [
      "Heart Rate Monitoring",
      "Built-in GPS",
      "7-day battery life",
      "Water resistant (50m)",
      "Sleep tracking",
      "Multiple sport modes",
    ],
    specifications: {
      Display: "1.4 inch AMOLED",
      "Battery Life": "7 days",
      "Water Resistance": "5ATM",
      Weight: "45g",
      Connectivity: "Bluetooth 5.0, Wi-Fi",
      Sensors: "Heart rate, GPS, Accelerometer",
    },
  },
  3: {
    id: 3,
    name: "Portable Bluetooth Speaker",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.7,
    reviews: 156,
    images: ["/portable-bluetooth-speaker.jpg", "/portable-bluetooth-speaker.jpg", "/portable-bluetooth-speaker.jpg"],
    category: "Electronics",
    brand: "SoundWave",
    inStock: true,
    stockCount: 25,
    badge: "Sale",
    description:
      "Compact yet powerful Bluetooth speaker with 360-degree sound, waterproof design, and 12-hour battery life. Perfect for outdoor adventures and home entertainment.",
    features: [
      "360-degree sound",
      "Waterproof (IPX7)",
      "12-hour battery life",
      "Wireless stereo pairing",
      "Built-in microphone",
      "Compact design",
    ],
    specifications: {
      "Output Power": "20W",
      "Battery Life": "12 hours",
      "Water Resistance": "IPX7",
      Weight: "600g",
      Connectivity: "Bluetooth 5.0",
      "Frequency Response": "60Hz - 20kHz",
    },
  },
  4: {
    id: 4,
    name: "Wireless Charging Pad",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.6,
    reviews: 78,
    images: ["/wireless-charging-pad.png", "/wireless-charging-pad.png", "/wireless-charging-pad.png"],
    category: "Electronics",
    brand: "ChargeTech",
    inStock: false,
    stockCount: 0,
    badge: "Hot",
    description:
      "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator and overcharge protection for safe, efficient charging.",
    features: [
      "Fast wireless charging (15W)",
      "Qi-compatible",
      "LED charging indicator",
      "Overcharge protection",
      "Non-slip surface",
      "Ultra-thin design",
    ],
    specifications: {
      "Output Power": "15W max",
      Input: "USB-C",
      Compatibility: "Qi-enabled devices",
      Weight: "150g",
      Dimensions: "100 x 100 x 8mm",
      Safety: "Over-current, over-voltage protection",
    },
  },
  5: {
    id: 5,
    name: "Gaming Mechanical Keyboard",
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.8,
    reviews: 203,
    images: ["/gaming-mechanical-keyboard.png", "/gaming-mechanical-keyboard.png", "/gaming-mechanical-keyboard.png"],
    category: "Electronics",
    brand: "GameTech",
    inStock: true,
    stockCount: 18,
    badge: "Gaming",
    description:
      "Professional gaming mechanical keyboard with RGB backlighting, tactile switches, and programmable keys. Built for competitive gaming and productivity.",
    features: [
      "Mechanical tactile switches",
      "RGB backlighting",
      "Programmable keys",
      "Anti-ghosting technology",
      "Detachable USB-C cable",
      "Aluminum frame",
    ],
    specifications: {
      "Switch Type": "Mechanical Tactile",
      Backlighting: "RGB",
      "Key Layout": "Full-size (104 keys)",
      Connection: "USB-C",
      "Polling Rate": "1000Hz",
      Weight: "1.2kg",
    },
  },
  6: {
    id: 6,
    name: "4K Webcam",
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.5,
    reviews: 67,
    images: ["/4k-webcam.png", "/4k-webcam.png", "/4k-webcam.png"],
    category: "Electronics",
    brand: "VisionTech",
    inStock: true,
    stockCount: 8,
    badge: "Professional",
    description:
      "Ultra HD 4K webcam with auto-focus, noise-canceling microphone, and wide-angle lens. Perfect for professional video calls, streaming, and content creation.",
    features: [
      "4K Ultra HD recording",
      "Auto-focus technology",
      "Noise-canceling microphone",
      "90-degree field of view",
      "Plug-and-play setup",
      "Privacy shutter",
    ],
    specifications: {
      Resolution: "4K (3840x2160) @ 30fps",
      "Field of View": "90 degrees",
      Focus: "Auto-focus",
      Microphone: "Dual stereo with noise cancellation",
      Connection: "USB 3.0",
      Compatibility: "Windows, Mac, Linux",
    },
  },
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const productId = params.id as string
  console.log("Product ID from URL:", productId)
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [reviews, setReviews] = useState<Array<{ name: string; rating: number; comment: string; date: string }>>([])
  const [reviewerName, setReviewerName] = useState("")
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewComment, setReviewComment] = useState("")
  // Site settings: badges under Key Features
  const [shippingTitle, setShippingTitle] = useState("Free Shipping")
  const [shippingSub, setShippingSub] = useState("On orders over TK50")
  const [warrantyTitle, setWarrantyTitle] = useState("2 Year Warranty")
  const [warrantySub, setWarrantySub] = useState("Full coverage")
  const [returnsTitle, setReturnsTitle] = useState("30-Day Returns")
  const [returnsSub, setReturnsSub] = useState("No questions asked")
  
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        // Fast path: fetch via cached API route (CDN/browser caching enabled)
        let productData: Product | null = null
        try {
          const res = await fetch(`/api/products/${encodeURIComponent(productId)}`)
          if (res.ok) {
            const json = await res.json().catch(() => null)
            if (json?.success && json?.product) {
              productData = json.product as Product
            }
          }
        } catch {}

        // Fallback: direct client-side Supabase fetch
        if (!productData) {
          productData = await getProductById(productId)
        }
        
        if (productData) {
          setProduct(productData)
        } else {
          // If no product returned from API, check mock data
          console.log("Product not found in database, checking mock data for ID:", productId)
          const numericId = parseInt(productId)
          const mockProduct = mockProductData[numericId as keyof typeof mockProductData]
          
          if (mockProduct) {
            // Convert mock product to API format
            setProduct({
              id: mockProduct.id.toString(),
              name: mockProduct.name,
              description: mockProduct.description,
              price: mockProduct.price,
              original_price: mockProduct.originalPrice,
              category: mockProduct.category,
              brand: mockProduct.brand,
              stock: mockProduct.inStock ? mockProduct.stockCount || 10 : 0,
              is_active: true,
              is_featured: mockProduct.badge === "Best Seller",
              tags: [],
              features: mockProduct.features || [],
              images: mockProduct.images,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              specifications: mockProduct.specifications || {},
              rating: mockProduct.rating,
              reviews: mockProduct.reviews,
              badge: mockProduct.badge,
              originalPrice: mockProduct.originalPrice
            })
          } else {
            setError(true)
          }

  // Submit a new review (localStorage persistence) (inner, ignored)
  const __inner_handleSubmitReview_ignore_0 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) return
    const name = reviewerName.trim() || "Anonymous"
    const comment = reviewComment.trim()
    const rating = Math.min(5, Math.max(1, Number(reviewRating) || 5))
    if (!comment) {
      toast({ title: "মন্তব্য লিখুন", description: "রিভিউ দেওয়ার জন্য একটি মন্তব্য লিখুন", variant: "destructive" })
      return
    }
    const newReview = { name, rating, comment, date: new Date().toISOString() }
    const next = [newReview, ...reviews]
    setReviews(next)
    try {
      const key = `reviews:${productId}`
      localStorage.setItem(key, JSON.stringify(next))
    } catch {}
    setReviewerName("")
    setReviewRating(5)
    setReviewComment("")
    toast({ title: "রিভিউ যোগ হয়েছে", description: "ধন্যবাদ, আপনার রিভিউটি সংরক্ষিত হয়েছে" })
  }

  // Share current product link via Web Share API or copy to clipboard
  const __inner_handleShare_ignore = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : ''
      if (navigator.share) {
        await navigator.share({ title: product?.name || 'Product', url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        toast({ title: "লিংক কপি হয়েছে", description: "প্রোডাক্ট লিংক ক্লিপবোর্ডে কপি করা হয়েছে" })
      }
    } catch (e) {
      toast({ title: "শেয়ার ব্যর্থ", description: "লিংক শেয়ার করতে সমস্যা হয়েছে", variant: "destructive" })
    }
  }

  // Local review submit (stored in localStorage)
  const __inner_handleSubmitReview_ignore = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) return
    const name = reviewerName.trim() || "Anonymous"
    const comment = reviewComment.trim()
    const rating = Math.min(5, Math.max(1, Number(reviewRating) || 5))
    if (!comment) {
      toast({ title: "মন্তব্য লিখুন", description: "রিভিউ দেওয়ার জন্য একটি মন্তব্য লিখুন", variant: "destructive" })
      return
    }
    const newReview = { name, rating, comment, date: new Date().toISOString() }
    const next = [newReview, ...reviews]
    setReviews(next)
    try {
      const key = `reviews:${productId}`
      localStorage.setItem(key, JSON.stringify(next))
    } catch {}
    setReviewerName("")
    setReviewRating(5)
    setReviewComment("")
    toast({ title: "রিভিউ যোগ হয়েছে", description: "ধন্যবাদ, আপনার রিভিউটি সংরক্ষিত হয়েছে" })
  }
  
  // Share current product link via Web Share API or copy to clipboard (inner, ignored)
  const __inner_handleShare_ignore_2 = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : ''
      if (navigator.share) {
        await navigator.share({ title: product?.name || 'Product', url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        toast({ title: "লিংক কপি হয়েছে", description: "প্রোডাক্ট লিংক ক্লিপবোর্ডে কপি করা হয়েছে" })
      }
    } catch (e) {
      toast({ title: "শেয়ার ব্যর্থ", description: "লিংক শেয়ার করতে সমস্যা হয়েছে", variant: "destructive" })
    }
  }

  // Local review submit (stored in localStorage)
  // duplicate inner review handler removed

        }
      } catch (err) {
        console.error("Error loading product:", err)
        setError(true)
        // Check mock data as fallback
        const numericId = parseInt(productId)
        const mockProduct = mockProductData[numericId as keyof typeof mockProductData]
        if (mockProduct) {
          setProduct({
            id: mockProduct.id.toString(),
            name: mockProduct.name,
            description: mockProduct.description,
            price: mockProduct.price,
            original_price: mockProduct.originalPrice,
            category: mockProduct.category,
            brand: mockProduct.brand,
            stock: mockProduct.inStock ? mockProduct.stockCount || 10 : 0,
            is_active: true,
            is_featured: mockProduct.badge === "Best Seller",
            tags: [],
            features: mockProduct.features || [],
            images: mockProduct.images,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            specifications: mockProduct.specifications || {},
            rating: mockProduct.rating,
            reviews: mockProduct.reviews,
            badge: mockProduct.badge,
            originalPrice: mockProduct.originalPrice
          })
        }
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      loadProduct()
    }
  }, [productId])

  // Load site settings for badges (shipping/warranty/returns)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin/site-settings')
        const json = await res.json()
        const s = json?.settings || {}
        if (typeof s.shipping_title === 'string') setShippingTitle(s.shipping_title)
        if (typeof s.shipping_sub === 'string') setShippingSub(s.shipping_sub)
        if (typeof s.warranty_title === 'string') setWarrantyTitle(s.warranty_title)
        if (typeof s.warranty_sub === 'string') setWarrantySub(s.warranty_sub)
        if (typeof s.returns_title === 'string') setReturnsTitle(s.returns_title)
        if (typeof s.returns_sub === 'string') setReturnsSub(s.returns_sub)
      } catch {}
    }
    loadSettings()
  }, [])

  // Load existing reviews from localStorage when product is ready
  useEffect(() => {
    try {
      if (!productId) return
      const key = `reviews:${productId}`
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
      const list = raw ? (JSON.parse(raw) as Array<{ name: string; rating: number; comment: string; date: string }>) : []
      setReviews(Array.isArray(list) ? list : [])
    } catch (e) {
      setReviews([])
    }
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        </div>
        <Footer />
        <div className="h-16 md:hidden" />
      </div>
    )
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
          <Button 
            className="mt-4 bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => router.push('/products')}
          >
            Browse Products
          </Button>
        </div>
        <Footer />
        <div className="h-16 md:hidden" />
      </div>
    )
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    const maxStock = product.stock || product.stock_quantity || 0
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    console.log("🛒 [PRODUCT] Add to cart clicked!", {
      productName: product.name,
      productId: product.id,
      quantity: quantity,
      price: product.price
    })
    setIsAddingToCart(true)
    
    try {
      // Add multiple items based on quantity
      for (let i = 0; i < quantity; i++) {
        const cartItem = {
          id: Number(product.id),
          name: product.name,
          price: product.price,
          originalPrice: product.original_price || product.price,
          image: product.images?.[0] || product.image_url || "/placeholder.svg"
        }
        console.log("🛒 [PRODUCT] Adding item to cart:", cartItem)
        addToCart(cartItem)
      }
      
      // Show success message
      console.log("🛒 [PRODUCT] Successfully added to cart")
      // Note: We avoid alert/toast here. Desktop feedback comes from cart-context toast; mobile has no notification as requested.
    } catch (error) {
      console.error("🛒 [PRODUCT] Error adding to cart:", error)
      // Note: Error notifications handled by cart-context on desktop; mobile stays silent per requirement.
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Share current product link via Web Share API or copy to clipboard
  const handleShare = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : ''
      if (navigator.share) {
        await navigator.share({ title: product?.name || 'Product', url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        toast({ title: "লিংক কপি হয়েছে", description: "প্রোডাক্ট লিংক ক্লিপবোর্ডে কপি করা হয়েছে" })
      }
    } catch (e) {
      toast({ title: "শেয়ার ব্যর্থ", description: "লিংক শেয়ার করতে সমস্যা হয়েছে", variant: "destructive" })
    }
  }

  // Submit a new review (component scope)
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) return
    const name = reviewerName.trim() || "Anonymous"
    const comment = reviewComment.trim()
    const rating = Math.min(5, Math.max(1, Number(reviewRating) || 5))
    if (!comment) {
      toast({ title: "মন্তব্য লিখুন", description: "রিভিউ দেওয়ার জন্য একটি মন্তব্য লিখুন", variant: "destructive" })
      return
    }
    const newReview = { name, rating, comment, date: new Date().toISOString() }
    const next = [newReview, ...reviews]
    setReviews(next)
    try {
      const key = `reviews:${productId}`
      localStorage.setItem(key, JSON.stringify(next))
    } catch {}
    setReviewerName("")
    setReviewRating(5)
    setReviewComment("")
    toast({ title: "রিভিউ যোগ হয়েছে", description: "ধন্যবাদ, আপনার রিভিউটি সংরক্ষিত হয়েছে" })
  }

  // Local review submit (stored in localStorage) (inner, ignored)
  const __inner_handleSubmitReview_ignore_2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) return
    const name = reviewerName.trim() || "Anonymous"
    const comment = reviewComment.trim()
    const rating = Math.min(5, Math.max(1, Number(reviewRating) || 5))
    if (!comment) {
      toast({ title: "মন্তব্য লিখুন", description: "রিভিউ দেওয়ার জন্য একটি মন্তব্য লিখুন", variant: "destructive" })
      return
    }
    const newReview = { name, rating, comment, date: new Date().toISOString() }
    const next = [newReview, ...reviews]
    setReviews(next)
    try {
      const key = `reviews:${productId}`
      localStorage.setItem(key, JSON.stringify(next))
    } catch {}
    setReviewerName("")
    setReviewRating(5)
    setReviewComment("")
    toast({ title: "রিভিউ যোগ হয়েছে", description: "ধন্যবাদ, আপনার রিভিউটি সংরক্ষিত হয়েছে" })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="relative flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Close button to go back to products list */}
        <Link
          href="/products"
          aria-label="প্রোডাক্ট পেজ বন্ধ করে প্রোডাক্টস তালিকায় ফিরুন"
          className="absolute top-2 right-2 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md border border-gray-200 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
        >
          <X className="h-5 w-5" />
        </Link>
        {/* Breadcrumb (hidden on mobile) */}
        <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <span>Home</span>
          <span>/</span>
          <span>Products</span>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-12 space-y-8 lg:space-y-0">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg shadow-sm border overflow-hidden">
              <img
                src={product.images ? product.images[selectedImage] : (product.image_url || "/placeholder.svg")}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                width="1200"
                height="1200"
              />
            </div>

            {/* Mobile thumbnails - small centered */}
            <div className="md:hidden flex justify-center gap-2 overflow-x-auto pb-2">
              {product.images ? product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 bg-white rounded-lg border-2 overflow-hidden ${
                    selectedImage === index ? "border-amber-500" : "border-gray-200"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width="80"
                    height="80"
                  />
                </button>
              )) : product.image_url ? (
                <button
                  className="flex-shrink-0 w-16 h-16 bg-white rounded-lg border-2 border-amber-500 overflow-hidden"
                >
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width="80"
                    height="80"
                  />
                </button>
              ) : null}
            </div>

            {/* Desktop thumbnails - smaller buttons */}
            <div className="hidden md:flex md:flex-wrap justify-center gap-2">
              {product.images ? product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 xl:w-20 xl:h-20 bg-white rounded-lg border-2 overflow-hidden ${
                    selectedImage === index ? "border-amber-500" : "border-gray-200"
                  }`}
                  aria-label={`${product.name} thumbnail ${index + 1}`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width="80"
                    height="80"
                  />
                </button>
              )) : product.image_url ? (
                <button
                  className="w-16 h-16 xl:w-20 xl:h-20 bg-white rounded-lg border-2 border-amber-500 overflow-hidden"
                  aria-label={`${product.name} thumbnail`}
                >
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width="80"
                    height="80"
                  />
                </button>
              ) : null}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-balance">{product.name}</h1>

              <div className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                Tk {product.price.toLocaleString('en-BD')}
              </div>

              <div className="hidden md:block">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{product.brand}</Badge>
                  {product.badge && (
                    <Badge
                      className={
                        product.badge === "Best Seller"
                          ? "bg-amber-500 text-white"
                          : product.badge === "New"
                            ? "bg-green-500 text-white"
                            : product.badge === "Sale"
                              ? "bg-red-500 text-white"
                              : product.badge === "Hot"
                                ? "bg-blue-500 text-white"
                                : product.badge === "Professional"
                                  ? "bg-purple-500 text-white"
                                  : ""
                      }
                    >
                      {product.badge}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating || 0) ? "text-amber-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium">{product.rating}</span>
                  <span className="text-gray-600">({product.reviews} reviews)</span>
                </div>

                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xl text-gray-500 line-through">TK{product.originalPrice}</span>
                    <Badge className="bg-green-100 text-green-800">
                      Save TK{(product.originalPrice - product.price).toFixed(2)}
                    </Badge>
                  </div>
                )}

                <p className="text-gray-600 leading-relaxed text-pretty">{product.description}</p>
              </div>
            </div>

            {/* Mobile Add to Cart - Unified Style (moved up on mobile) */}
            <div className="md:hidden mb-2">
              <Button
                className="relative overflow-hidden group/button w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-95 py-3 text-base rounded-sm disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                disabled={(product.stock || product.stock_quantity || 0) <= 0 || isAddingToCart}
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart();
                }}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] group-hover/button:translate-x-full transition-transform duration-700 ease-out"></span>
                {isAddingToCart ? "Adding..." : "Add to cart"}
              </Button>
            </div>

            {/* Mobile Stock Status (visible on mobile only) */}
            <div className="md:hidden text-sm text-gray-600 mb-1">
              {(product.stock || product.stock_quantity || 0) > 0 ? (
                <span className="text-green-600">✓ স্টকে আছে ({product.stock || product.stock_quantity || 0} টি উপলব্ধ)</span>
              ) : (
                <span className="text-red-600">✗ স্টকে নেই</span>
              )}
            </div>

            {/* Mobile Description (short) */}
            <p className="md:hidden text-gray-600 text-sm mb-2 leading-relaxed line-clamp-2">
              {product.description}
            </p>

            

            {/* Desktop Quantity and Add to Cart */}
            <Card className="hidden md:block">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Quantity:</span>
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 font-medium">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= (product.stock || product.stock_quantity || 0)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    {(product.stock || product.stock_quantity || 0) > 0 ? (
                      <span className="text-green-600">✓ স্টকে আছে ({product.stock || product.stock_quantity || 0} টি উপলব্ধ)</span>
                    ) : (
                      <span className="text-red-600">✗ স্টকে নেই</span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="relative overflow-hidden group/button flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-95 rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      size="lg"
                      disabled={(product.stock || product.stock_quantity || 0) <= 0 || isAddingToCart}
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart();
                      }}
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] group-hover/button:translate-x-full transition-transform duration-700 ease-out"></span>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {isAddingToCart ? "যোগ করা হচ্ছে..." : "কার্টে যোগ করুন"}
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleShare}>
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features (hidden on mobile) */}
            <Card className="hidden md:block">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features && product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Shipping & Returns (from site settings) - hidden on mobile */}
            <div className="hidden md:grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <Truck className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">{shippingTitle}</p>
                <p className="text-xs text-gray-600">{shippingSub}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <Shield className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">{warrantyTitle}</p>
                <p className="text-xs text-gray-600">{warrantySub}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <RotateCcw className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">{returnsTitle}</p>
                <p className="text-xs text-gray-600">{returnsSub}</p>
              </div>
            </div>

            {/* Mobile Description (replaces Features/Boxes on mobile) */}
            <div className="md:hidden bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({(reviews?.length || 0)})</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Reviews List */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Customer Reviews</h3>
                    {reviews.length === 0 ? (
                      <p className="text-gray-600">এখনও কোনো রিভিউ নেই। প্রথম রিভিউ দিন!</p>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-auto pr-2">
                        {reviews.map((r, idx) => (
                          <div key={idx} className="border-b pb-3">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-gray-900">{r.name}</div>
                              <div className="text-xs text-gray-500">{new Date(r.date).toLocaleString()}</div>
                            </div>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Review Form */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Your Name</label>
                        <input
                          type="text"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          className="w-full border rounded-md px-3 py-2"
                          placeholder="Your name (optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Rating</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="w-full border rounded-md px-3 py-2"
                        >
                          {[5,4,3,2,1].map(v => (
                            <option key={v} value={v}>{v} Star{v>1?'s':''}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Your Review</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full border rounded-md px-3 py-2 min-h-[100px]"
                          placeholder="Write your experience..."
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Submit Review</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Shipping Information</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Free standard shipping on orders over TK50</li>
                        <li>• Express shipping available for TK9.99</li>
                        <li>• Orders processed within 1-2 business days</li>
                        <li>• Delivery time: 3-7 business days</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Returns & Exchanges</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• 30-day return policy</li>
                        <li>• Items must be in original condition</li>
                        <li>• Free return shipping on defective items</li>
                        <li>• Refunds processed within 5-7 business days</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {/* JSON-LD: Product + Breadcrumb for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              alternateName: product.name,
              description: product.description,
              image: (product.images && product.images.length > 0 ? product.images[0] : product.image_url) || "/placeholder.svg",
              sku: String(product.id),
              brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
              category: product.category,
              offers: {
                "@type": "Offer",
                priceCurrency: "BDT",
                price: Number(product.price || 0),
                availability: (product.stock || product.stock_quantity || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                url: (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : "")) + `/products/${encodeURIComponent(String(product.id))}`,
              },
              aggregateRating: (product.rating || 0) > 0 ? {
                "@type": "AggregateRating",
                ratingValue: Number(product.rating || 0),
                reviewCount: Number(product.reviews || 0),
              } : undefined,
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : "") },
                { "@type": "ListItem", position: 2, name: "Products", item: (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : "")) + "/products" },
                { "@type": "ListItem", position: 3, name: product.name, item: (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : "")) + `/products/${encodeURIComponent(String(product.id))}` },
              ],
            }),
          }}
        />
      </main>

      <Footer />
      <div className="h-16 md:hidden" />
    </div>
  )
}
