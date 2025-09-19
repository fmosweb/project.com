"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { useCartUI } from "@/contexts/cart-ui-context"

export default function CartPage() {
  const { items: cartItems, updateQuantity, removeFromCart } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { openCart } = useCartUI()
  const [isMobile, setIsMobile] = useState(false)
  const [stickyMounted, setStickyMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setStickyMounted(true), 50)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    const handler = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640)
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  useEffect(() => {
    if (!isMobile) return
    // Open the new mobile drawer and navigate back to previous page (or home)
    try { openCart() } catch {}
    try {
      if (typeof window !== 'undefined' && window.history.length > 1) router.back()
      else router.push('/')
    } catch {}
  }, [isMobile])
  
  // Keep sticky summary always visible (no auto-hide on scroll)
  const [stickyVisible] = useState(true)

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const savings = cartItems.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0)
  const shipping = 150 // fixed shipping cost in BDT, set to 0 for free shipping
  const total = subtotal + shipping

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Ensure cart is persisted for guest before redirecting
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems))
        localStorage.setItem('cart:guest', JSON.stringify(cartItems))
        sessionStorage.setItem('cartBackup', JSON.stringify(cartItems))
      } catch {}
      // Redirect to login with return path to checkout
      try { router.push("/auth/email-login?return=/checkout") } catch { window.location.href = "/auth/email-login?return=/checkout" }
      return
    }
    try { router.push("/checkout") } catch { window.location.href = "/checkout" }
  }

  // Removed modal-based auth flow; direct redirect used

  // On mobile, do not render the old cart page UI at all
  if (isMobile) {
    return null
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8 text-pretty">
              Looks like you haven't added any products to your cart yet. Start shopping!
            </p>
            <Link href="/">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">Continue Shopping</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-48 md:pb-24 lg:pb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900">Shopping Cart</span>
        </nav>

        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        <div className="grid gap-6 items-start lg:grid-cols-[2.5fr_1fr]">
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="md:hidden border-0 shadow-sm">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-medium text-gray-900 mb-0.5 line-clamp-1">{item.name}</h3>
                      <p className="text-xs font-bold text-gray-900">Tk {item.price.toLocaleString('en-BD')}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 p-0 hover:bg-gray-100"
                      >
                        <Minus className="h-2.5 w-2.5" />
                      </Button>
                      <span className="px-1.5 py-0.5 text-xs font-medium min-w-[1.5rem] text-center bg-gray-50 rounded">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 p-0 hover:bg-gray-100"
                      >
                        <Plus className="h-2.5 w-2.5" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-6 w-12 p-0 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Desktop Cart Items (grouped in a single card, rows like Checkout summary) */}
            <Card className="hidden md:block border border-gray-200 rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={`desktop-${item.id}`} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg border overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base font-bold text-gray-900">TK{item.price.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 line-through">TK{item.originalPrice.toLocaleString()}</span>
                        </div>
                        <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 hover:bg-gray-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-3 text-sm font-medium min-w-[2.5rem] text-center bg-white">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 hover:bg-gray-100"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="ml-auto text-right">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-base font-bold text-gray-900">TK{(item.price * item.quantity).toLocaleString()}</p>
                            <p className="text-[11px] text-gray-500">TK{item.price.toLocaleString()} each</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card className="hidden lg:block lg:sticky lg:top-24 border border-gray-200 shadow-sm rounded-xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base">
                      সাবটোটাল ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} টি পণ্য)
                    </span>
                    <span className="font-medium">TK{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-green-600">
                    <span className="text-sm sm:text-base">Savings</span>
                    <span className="font-medium">-TK{savings.toFixed(0)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base">ডেলিভারি চার্জ</span>
                    <span className="font-medium">TK{shipping}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>TK{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white mt-6 text-base font-medium rounded-lg"
                  size="lg"
                  onClick={handleCheckout}
                >
                  {isAuthenticated ? "Proceed to Checkout" : "Login to Place Order"}
                </Button>
              </CardContent>
            </Card>

            {/* Promo Code (desktop) */}
            <Card className="hidden lg:block border border-gray-200 shadow-sm rounded-xl">
              <CardContent className="p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Promo Code</h3>
                <div className="flex gap-2">
                  <Input placeholder="Enter promo code" className="h-10 border-gray-300" />
                  <Button variant="outline" className="h-10 px-6 border-gray-300 hover:bg-gray-50">Apply</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      {/* Sticky order summary for <lg screens (above bottom nav on mobile) */}
      <div
        className={`lg:hidden fixed left-0 right-0 bottom-16 md:bottom-2 z-[60] backdrop-blur-md bg-gradient-to-tr from-amber-50/95 via-white/95 to-amber-50/95 border-t border-amber-100 ring-1 ring-amber-200/60 shadow-xl px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)] rounded-t-2xl transform transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          stickyMounted ? (stickyVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none") : "translate-y-4 opacity-0 pointer-events-none"
        }`}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-gray-600">মোট</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">TK{total.toFixed(2)}</div>
          </div>
          <Button
            className="flex-1 h-11 bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg transition-shadow transition-transform active:scale-[0.98] btn-pulse-glow btn-shine"
            size="lg"
            onClick={handleCheckout}
          >
            {isAuthenticated ? "Proceed to Checkout" : "Login to Place Order"}
          </Button>
        </div>
      </div>
      </main>

      {/* Authentication Modal removed: using login page redirect */}
    </div>
  )
}
