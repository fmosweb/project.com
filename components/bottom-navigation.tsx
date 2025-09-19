"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Home, Package, ShoppingCart, Grid3X3 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useCartUI } from "@/contexts/cart-ui-context"

export default function BottomNavigation() {
  const pathname = usePathname()
  const { getTotalItems } = useCart()
  const cartCount = getTotalItems()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { openCart } = useCartUI()

  // Hide bottom navigation on account pages only
  if (pathname === '/account' || pathname?.startsWith('/account/')) {
    return null
  }

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
    },
    {
      href: "/products",
      icon: Package,
      label: "Products",
    },
    {
      href: "/cart",
      icon: ShoppingCart,
      label: "Cart",
    },
    {
      href: "/categories",
      icon: Grid3X3,
      label: "Categories",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-amber-100 ring-1 ring-amber-200/60 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:hidden z-50">
      <div className="flex items-center justify-around py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          if (item.href === "/cart") {
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => openCart()}
                className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 relative ${
                  pathname === "/cart" ? "text-amber-600" : "text-gray-500 hover:text-amber-600"
                }`}
                aria-label="Open cart"
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${pathname === "/cart" ? "text-amber-600" : "text-gray-500"}`} />
                  <span
                    className={`absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] text-[10px] font-medium ${
                      cartCount > 0 ? "" : "hidden"
                    }`}
                    aria-hidden={cartCount <= 0}
                    suppressHydrationWarning
                  >
                    {mounted && cartCount > 0 ? cartCount : ""}
                  </span>
                </div>
                <span className={`text-xs mt-1 font-medium ${pathname === "/cart" ? "text-amber-600" : "text-gray-500"}`}>
                  {item.label}
                </span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 relative ${
                isActive ? "text-amber-600" : "text-gray-500 hover:text-amber-600"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "text-amber-600" : "text-gray-500"}`} />
              </div>
              <span className={`text-xs mt-1 font-medium ${isActive ? "text-amber-600" : "text-gray-500"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
