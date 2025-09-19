"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, User, Menu, X, Search, LogOut, UserCircle, ShoppingBag } from "lucide-react"
import { useCartUI } from "@/contexts/cart-ui-context"
import AccountLink from "@/components/account-link"
import MobileAccountLink from "@/components/mobile-account-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { searchProducts, type Product } from "@/lib/services/products-client"
import { AuthModal } from "@/components/auth-modal"
import { useCart } from "@/contexts/cart-context"
import { useSearch } from "@/contexts/search-context"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getTotalItems } = useCart()
  const cartCount = getTotalItems()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const { searchQuery, setSearchQuery } = useSearch()
  const [localSearchQuery, setLocalSearchQuery] = useState("")
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searching, setSearching] = useState(false)
  const { openCart } = useCartUI()

  // Mounted guard to avoid SSR/CSR mismatch for auth-dependent UI
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Detect mobile viewport (sm breakpoint ~640px)
  useEffect(() => {
    const handler = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640)
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (localSearchQuery.trim()) {
      setSearchQuery(localSearchQuery.trim())
      router.push(`/search?q=${encodeURIComponent(localSearchQuery.trim())}`)
      setIsMenuOpen(false) // Close mobile menu after search
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value)
  }

  // Auto navigate only when already on /search; otherwise keep inline suggestions
  useEffect(() => {
    const t = setTimeout(() => {
      const q = localSearchQuery.trim()
      if (!q) return
      try {
        setSearchQuery(q)
        const isOnSearch = typeof window !== 'undefined' && window.location.pathname.startsWith('/search')
        if (!isOnSearch) return
        // Avoid redundant navigations
        const url = new URL(window.location.href)
        const currentQ = (url.searchParams.get('q') || '').trim()
        if (currentQ === q) return
        router.replace(`/search?q=${encodeURIComponent(q)}`)
        setIsMenuOpen(false)
      } catch {}
    }, 350)
    return () => clearTimeout(t)
  }, [localSearchQuery, router, setSearchQuery])

  // Debounced suggestions fetch
  useEffect(() => {
    const q = localSearchQuery.trim()
    if (!q) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const t = setTimeout(async () => {
      try {
        setSearching(true)
        const results = await searchProducts(q)
        setSuggestions(results.slice(0, 6))
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [localSearchQuery])

  // Suggestion dropdown UI
  const SuggestDropdown = () => (
    showSuggestions && suggestions.length > 0 ? (
      <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        <ul className="max-h-80 overflow-auto divide-y">
          {suggestions.map((p) => (
            <li key={p.id} className="hover:bg-gray-50">
              <button
                type="button"
                className="w-full text-left flex items-center gap-3 p-3"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setShowSuggestions(false)
                  router.push(`/products/${p.id}`)
                  setIsMenuOpen(false)
                }}
              >
                <img
                  src={(p.images && p.images.length > 0 ? p.images[0] : (p as any).image_url) || "/placeholder.svg"}
                  alt={p.name}
                  className="h-10 w-10 rounded object-contain bg-gray-50"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 truncate">TK{Number(p.price ?? 0).toLocaleString()}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const q = localSearchQuery.trim()
              if (q) {
                router.push(`/search?q=${encodeURIComponent(q)}`)
                setShowSuggestions(false)
                setIsMenuOpen(false)
              }
            }}
          >
            View all results for "{localSearchQuery.trim()}"
          </Button>
        </div>
      </div>
    ) : (
      searching && localSearchQuery.trim() ? (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500">Searching…</div>
      ) : null
    )
  )

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            {/* Mobile menu button (left) */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 absolute left-1/2 -translate-x-1/2 md:static md:transform-none">
              <Image src="/images/fmosweb-logo.png" alt="FMOSWEB" width={120} height={40} className="h-8 w-auto" />
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={localSearchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => setShowSuggestions(!!localSearchQuery.trim() && suggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-600"
                >
                  <Search className="h-4 w-4" />
                </button>
                <SuggestDropdown />
              </form>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-amber-600 font-medium">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-amber-600 font-medium">
                Products
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-amber-600 font-medium">
                Categories
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-amber-600 font-medium">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-amber-600 font-medium">
                Contact
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="relative transform transition-all duration-200 hover:scale-105"
                onClick={(e) => {
                  e.preventDefault()
                  if (isMobile) {
                    openCart()
                  } else {
                    router.push('/cart')
                  }
                }}
                aria-label="Open cart"
              >
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                <span
                  className={`absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse ${
                    cartCount > 0 ? "" : "hidden"
                  }`}
                  aria-hidden={cartCount <= 0}
                  suppressHydrationWarning
                >
                  {mounted && cartCount > 0 ? cartCount : ""}
                </span>
              </Button>

              {mounted && isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <AccountLink />
                </div>
              ) : (
                <Button variant="ghost" size="sm" className="hidden md:flex" asChild>
                  <Link href="/auth/email-login?return=/products">
                    <span className="flex items-center"><User className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 mr-2" />Account</span>
                  </Link>
                </Button>
              )}

              {/* Mobile menu button moved to left */}
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={localSearchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowSuggestions(!!localSearchQuery.trim() && suggestions.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-600"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  <SuggestDropdown />
                </form>

                <nav className="flex flex-col space-y-2">
                  <Link href="/" className="text-gray-700 hover:text-amber-600 font-medium py-2">
                    Home
                  </Link>
                  <Link href="/products" className="text-gray-700 hover:text-amber-600 font-medium py-2">
                    Products
                  </Link>
                  <Link href="/categories" className="text-gray-700 hover:text-amber-600 font-medium py-2">
                    Categories
                  </Link>
                  <Link href="/about" className="text-gray-700 hover:text-amber-600 font-medium py-2">
                    About
                  </Link>
                  <Link href="/contact" className="text-gray-700 hover:text-amber-600 font-medium py-2">
                    Contact
                  </Link>

                  {mounted && isAuthenticated ? (
                    <>
                      <div onClick={() => setIsMenuOpen(false)}>
                        <MobileAccountLink />
                      </div>
                      <Link
                        href="/account/orders"
                        className="text-gray-700 hover:text-amber-600 font-medium py-2 flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" /> Orders
                      </Link>
                      <Button variant="ghost" className="justify-start p-2" onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" className="justify-start p-2" asChild>
                      <Link href="/auth/email-login?return=/products">
                        <span className="flex items-center"><User className="h-4 w-4 mr-2" />Account</span>
                      </Link>
                    </Button>
                  )}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
