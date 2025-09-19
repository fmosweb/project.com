"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ShoppingCart, Eye, Zap, Shield, Truck } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  price: number
  original_price?: number
  originalPrice?: number
  rating?: number
  reviews?: number
  images?: string[]
  image_url?: string
  image?: string
  category: string
  brand?: string
  stock?: number
  stock_quantity?: number
  inStock?: boolean
  badge?: string
  is_active?: boolean
  is_featured?: boolean
}

interface ProductCardProps {
  product: Product
  viewMode: "grid" | "list"
}

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [adding, setAdding] = useState(false)

  const handleAddToCart = (product: Product) => {
    console.log("🛒 [PRODUCT CARD] Adding product to cart:", {
      id: product.id,
      name: product.name,
      price: product.price,
      inStock: product.inStock,
      stock: product.stock,
      stock_quantity: product.stock_quantity
    })
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: (product.originalPrice ?? product.original_price ?? product.price),
      image: product.image || (product.images && product.images.length > 0 ? product.images[0] : product.image_url) || "/placeholder.svg",
    }
    
    console.log("🛒 [PRODUCT CARD] Cart item data:", cartItem)
    addToCart(cartItem)
    console.log("🛒 [PRODUCT CARD] Product added to cart successfully")

    try {
      setAdding(true)
      setTimeout(() => setAdding(false), 700)
    } catch {}
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 640 || (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 640px)').matches))
    if (!isMobile) {
      try {
        toast({ title: "কার্টে যোগ হয়েছে", description: `${product.name}` })
      } catch {}
    }
  }

  const isInStock = product.inStock || (product.stock || 0) > 0
  const baseOriginal = (product.originalPrice ?? product.original_price)
  const discountPercentage = baseOriginal 
    ? Math.round(((baseOriginal - product.price) / baseOriginal) * 100)
    : 0

  if (viewMode === "list") {
    return (
      <Card className="group hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-gray-300 shadow-lg bg-gradient-to-r from-white to-gray-50 overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            <Link href={`/products/${product.id}`} className="relative w-full h-48 sm:w-48 sm:h-48 flex-shrink-0 block cursor-pointer active:scale-95 transition-transform duration-300 touch-manipulation rounded-xl overflow-hidden bg-white">
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <img
                  src={product.image || (product.images && product.images.length > 0 ? product.images[0] : product.image_url) || "/placeholder.svg"}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain transition-all duration-500 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              
              {/* Premium Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {product.badge && (
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
                      product.badge === "Best Seller"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : product.badge === "New"
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          : product.badge === "Sale"
                            ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                            : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    }`}
                  >
                    {product.badge}
                  </span>
                </div>
              )}

              {discountPercentage > 0 && (
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 text-xs font-bold rounded-full shadow-lg">
                    -{discountPercentage}%
                  </span>
                </div>
              )}
            </Link>

            <div className="flex-1 p-4 sm:p-6 relative">
              {/* Premium Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <Link href={`/products/${product.id}`} className="flex-1 cursor-pointer active:scale-95 transition-transform duration-300 touch-manipulation">
                    <p className="text-sm text-gray-500 mb-1 hover:text-amber-600 font-medium">{product.brand}</p>
                    <h3 className="font-bold text-gray-900 hover:text-amber-600 text-lg sm:text-xl mb-2 leading-tight line-clamp-2">{product.name}</h3>
                  </Link>
                  {/* Wishlist removed as requested */}
                </div>

                <div className="hidden sm:flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating || 0) ? "text-amber-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2 font-medium">
                    {product.rating || 0} ({product.reviews || 0} reviews)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl sm:text-2xl font-bold text-amber-600 sm:text-gray-900">TK{product.price}</span>
                    {(product.originalPrice || product.original_price) && (
                      <>
                        <span className="text-base text-gray-500 line-through">TK{product.originalPrice || product.original_price}</span>
                        <span className="text-sm text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">
                          সাশ্রয় TK{((product.originalPrice || product.original_price || 0) - product.price).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Inline actions hidden on mobile */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="outline" size="sm" className="hover:bg-amber-50 hover:border-amber-300 transition-colors duration-300">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button
                      className={`relative overflow-hidden group/button ${isInStock ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-95' : 'bg-gray-400 text-gray-200 cursor-not-allowed'} rounded-sm`}
                      disabled={!isInStock}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleAddToCart(product)
                      }}
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] group-hover/button:translate-x-full transition-transform duration-700 ease-out"></span>
                      <ShoppingCart className={`h-4 w-4 mr-2 ${adding ? "cart-icon-anim" : ""}`} />
                      {isInStock ? "কার্টে যোগ করুন" : "স্টকে নেই"}
                    </Button>
                  </div>
                </div>

                {/* Mobile full-width Add to Cart */}
                <div className="sm:hidden mt-3">
                  <Button
                    className={`relative overflow-hidden group/button w-full ${isInStock ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-95' : 'bg-gray-400 text-gray-200 cursor-not-allowed'} py-2 text-sm rounded-sm disabled:opacity-60 disabled:cursor-not-allowed`}
                    disabled={!isInStock}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddToCart(product)
                    }}
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] group-hover/button:translate-x-full transition-transform duration-700 ease-out"></span>
                    <ShoppingCart className={`h-4 w-4 mr-2 ${adding ? "cart-icon-anim" : ""}`} />
                    {isInStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>

                {/* Premium Features (hidden on mobile for compactness) */}
                <div className="mt-4 hidden sm:flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Truck className="h-3 w-3 mr-1" />
                    <span>বিনামূল্যে শিপিং</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    <span>ওয়ারেন্টি</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    <span>দ্রুত ডেলিভারি</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-300 bg-white rounded-xl overflow-hidden">
      <CardContent className="p-0">
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative overflow-hidden bg-white p-4">
            {/* Wishlist Heart Icon */}
            <button 
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <svg className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            
            <div className="w-full h-48 sm:h-56 flex items-center justify-center">
              <img
                src={product.image || (product.images && product.images.length > 0 ? product.images[0] : product.image_url) || "/placeholder.svg"}
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </div>

            {discountPercentage > 0 && (
              <div className="absolute top-2 left-2">
                <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                  -{discountPercentage}%
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className="p-3 sm:p-5 relative">
          {/* Premium Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="mb-2">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 min-h-[40px]">{product.name}</h3>
            </div>
            <div className="mb-2">
              <p className="text-xs text-gray-500 line-clamp-1">
                {product.brand || product.category || 'Premium quality product'}
              </p>
            </div>

            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating || 4) ? "text-amber-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 ml-1">
                ({product.reviews || Math.floor(Math.random() * 100 + 10)})
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900">
                  <sup className="text-xs">৳</sup>{product.price}<sup className="text-xs">.00</sup>
                </span>
                {(product.originalPrice || product.original_price) && (
                  <span className="text-sm text-gray-500 line-through">
                    ৳{product.originalPrice || product.original_price}
                  </span>
                )}
              </div>
            </div>

            {(product.originalPrice || product.original_price) && (
              <div className="mb-3">
                <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">
                  সাশ্রয় TK{((product.originalPrice || product.original_price || 0) - product.price).toFixed(2)}
                </span>
              </div>
            )}

            {/* Premium Features (hidden on mobile) */}
            <div className="hidden sm:flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Truck className="h-3 w-3 mr-1" />
                  <span>বিনামূল্যে শিপিং</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  <span>ওয়ারেন্টি</span>
                </div>
              </div>
              <div className="flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                <span>দ্রুত</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
