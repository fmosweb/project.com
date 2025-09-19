"use client"

import type React from "react"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProductCard from "@/components/product-card-clean"
import { useSearch } from "@/contexts/search-context"
import { searchProducts, type Product } from "@/lib/services/products-client"

// Mock product data for fallback
const mockProducts = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 299.99,
    originalPrice: 399.99,
    image: "/premium-wireless-headphones.png",
    rating: 4.8,
    reviews: 124,
    badge: "Best Seller",
    inStock: true,
    category: "Electronics",
    brand: "AudioTech",
    description: "High-quality wireless headphones with noise cancellation",
  },
  {
    id: "2",
    name: "Gaming Mechanical Keyboard",
    price: 149.99,
    originalPrice: 199.99,
    image: "/gaming-mechanical-keyboard.png",
    rating: 4.6,
    reviews: 89,
    badge: "New",
    inStock: true,
    category: "Electronics",
    brand: "GameTech",
    description: "RGB mechanical keyboard for gaming enthusiasts",
  },
  {
    id: "3",
    name: "Wireless Mouse",
    price: 79.99,
    originalPrice: 99.99,
    image: "/placeholder.svg",
    rating: 4.4,
    reviews: 156,
    badge: "Sale",
    inStock: false,
    category: "Electronics",
    brand: "TechPro",
    description: "Ergonomic wireless mouse with precision tracking",
  },
  {
    id: "4",
    name: "Smartphone Stand",
    price: 29.99,
    originalPrice: 39.99,
    image: "/placeholder.svg",
    rating: 4.2,
    reviews: 67,
    inStock: true,
    category: "Accessories",
    brand: "MobileTech",
    description: "Adjustable smartphone stand for desk use",
  },
  {
    id: "5",
    name: "Bluetooth Speaker",
    price: 89.99,
    originalPrice: 119.99,
    image: "/placeholder.svg",
    rating: 4.7,
    reviews: 203,
    badge: "Best Seller",
    inStock: true,
    category: "Electronics",
    brand: "SoundWave",
    description: "Portable Bluetooth speaker with premium sound quality",
  },
  {
    id: "6",
    name: "USB-C Charging Cable",
    price: 19.99,
    originalPrice: 29.99,
    image: "/placeholder.svg",
    rating: 4.3,
    reviews: 89,
    inStock: true,
    category: "Accessories",
    brand: "ChargeTech",
    description: "Fast charging USB-C cable with durable design",
  },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const { setSearchQuery, setSearchResults } = useSearch()
  const [localQuery, setLocalQuery] = useState(query)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const performSearch = async (searchTerm: string) => {
    setIsLoading(true)
    setError(false)

    if (!searchTerm.trim()) {
      // Use mock data when no search term
      setFilteredProducts(mockProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        original_price: p.originalPrice,
        category: p.category,
        brand: p.brand,
        stock: p.inStock ? 10 : 0,
        is_active: true,
        is_featured: p.badge === "Best Seller",
        tags: [],
        features: [],
        images: [p.image],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
      setSearchResults([])
    } else {
      try {
        // Call the API search function
        const results = await searchProducts(searchTerm)
        setFilteredProducts(results)
        setSearchResults(results)
      } catch (err) {
        console.error("Error searching products:", err)
        setError(true)
        
        // Fallback to mock data
        const mockResults = mockProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()),
        ).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          original_price: p.originalPrice,
          category: p.category,
          brand: p.brand,
          stock: p.inStock ? 10 : 0,
          is_active: true,
          is_featured: p.badge === "Best Seller",
          tags: [],
          features: [],
          images: [p.image],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        setFilteredProducts(mockResults)
        setSearchResults(mockResults)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (query) {
      setLocalQuery(query)
      setSearchQuery(query)
      performSearch(query)
    }
  }, [query, setSearchQuery, setSearchResults])

  // Auto-search on typing (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setSearchQuery(localQuery)
        performSearch(localQuery)
        // Update URL without full navigation
        const url = new URL(window.location.href)
        if (localQuery.trim()) url.searchParams.set("q", localQuery)
        else url.searchParams.delete("q")
        window.history.replaceState({}, "", url.toString())
      } catch {}
    }, 350)
    return () => clearTimeout(t)
  }, [localQuery, setSearchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(localQuery)
    // Update URL without navigation
    const url = new URL(window.location.href)
    url.searchParams.set("q", localQuery)
    window.history.replaceState({}, "", url.toString())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Products</h1>
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search for products, categories, brands..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-600"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Search Results */}
        <div>
          {query && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Search results for "{query}"</h2>
              <p className="text-gray-600 mt-1">
                {isLoading ? "Searching..." : `${filteredProducts.length} products found`}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewMode="grid" />
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any products matching "{query}". Try different keywords or browse our categories.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/products">
                  <Button>Browse All Products</Button>
                </Link>
                <Link href="/categories">
                  <Button variant="outline">View Categories</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start your search</h3>
              <p className="text-gray-600">Enter keywords to find products you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}
