"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { useCartUI } from "@/contexts/cart-ui-context"

interface Product {
  id: string
  name: string
  price: number
  original_price?: number
  originalPrice?: number
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
}

export default function ProductCardSimple({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { openCart } = useCartUI()
  const [adding, setAdding] = useState(false)

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
    // Mobile UX: Open cart drawer immediately, no toast
    try { openCart() } catch {}
  }

  const isInStock = product.inStock || (product.stock || 0) > 0

  return (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative">
      <Link href={`/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className="relative overflow-hidden bg-white" style={{ paddingBottom: '88%' }}>
          <img
            src={product.image || (product.images && product.images.length > 0 ? product.images[0] : product.image_url) || "/placeholder.svg"}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="px-3 py-1">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[1.75rem]">
            {product.name}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="mb-1">
          <span className="text-sm sm:text-base font-semibold text-gray-900">
            TK {product.price.toLocaleString('en-BD')}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          className={`relative overflow-hidden group/button w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-95 py-1.5 text-xs sm:text-sm rounded-sm disabled:opacity-60 disabled:cursor-not-allowed`}
          size="sm"
          disabled={!isInStock}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleAddToCart(product)
          }}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] group-hover/button:translate-x-full transition-transform duration-700 ease-out"></span>
          Quick Add
        </Button>
      </div>
    </Card>
  )
}
