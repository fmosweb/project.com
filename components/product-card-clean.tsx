"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Heart } from "lucide-react"
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

export default function ProductCardClean({ product, viewMode }: ProductCardProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [adding, setAdding] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleAddToCart = (product: Product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: (product.originalPrice ?? product.original_price ?? product.price),
      image: product.image || (product.images && product.images.length > 0 ? product.images[0] : product.image_url) || "/placeholder.svg",
    }
    
    addToCart(cartItem)
    
    try {
      setAdding(true)
      setTimeout(() => setAdding(false), 700)
    } catch {}
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 640 || (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 640px)').matches))
    if (!isMobile) {
      try {
        toast({ title: "Added to cart", description: `${product.name}` })
      } catch {}
    }
  }

  const isInStock = product.inStock !== false && (product.stock || 0) > 0
  const baseOriginal = (product.originalPrice ?? product.original_price)
  const hasDiscount = baseOriginal && baseOriginal > product.price
  
  // Generate random review count if not provided
  const reviewCount = product.reviews || Math.floor(Math.random() * 500 + 50)
  const rating = product.rating || 4 + Math.random()

  if (viewMode === "list") {
    // List view implementation can go here if needed
    return null
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white rounded-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Image Container */}
          <Link href={`/products/${product.id}`} className="block bg-gray-50 relative">
            <div className="w-full h-48 sm:h-56 flex items-center justify-center p-4">
              <img
                src={product.image || (product.images && product.images.length > 0 ? product.images[0] : product.image_url) || "/placeholder.svg"}
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Link>

          {/* Wishlist Heart Icon */}
          <button 
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-md hover:shadow-lg transition-all duration-200"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsFavorite(!isFavorite)
            }}
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
              }`} 
            />
          </button>
        </div>

        {/* Product Details */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Category/Brand */}
          <p className="text-xs text-gray-500 mb-2">
            {product.brand || product.category || 'Premium Product'}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 ml-1">
              ({reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              TK{Number(product.price).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                TK{Number(baseOriginal || 0).toLocaleString()}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            className={`relative overflow-hidden group/button w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-95 py-2.5 rounded-sm text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed`}
            disabled={!isInStock}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleAddToCart(product)
            }}
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] group-hover/button:translate-x-full transition-transform duration-700 ease-out"></span>
            {isInStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
