"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { useAuth } from "@/contexts/auth-context"

export interface CartItem {
  id: string | number
  name: string
  price: number
  originalPrice: number
  image: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Omit<CartItem, "quantity">) => void
  removeFromCart: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Important: Avoid reading localStorage in the initializer to prevent SSR/CSR hydration mismatch.
  // We'll load from storage in useEffect below.
  const [items, setItems] = useState<CartItem[]>([])
  // Hydration guard to avoid clobbering existing localStorage with empty state on first mount
  const hydratedRef = useRef(false)

  const { user } = useAuth()
  const normalizeEmail = (e?: string) => (e || "").trim().toLowerCase()
  const userEmail = normalizeEmail(user?.email)
  const storageKey = userEmail ? `cart:${userEmail}` : 'cart:guest'
  const router = useRouter()

  // Persist cart to server for logged-in email
  const persistServerCart = async (email: string, currentItems: CartItem[]) => {
    try {
      if (!email) return
      // Send only required fields
      const payload = {
        email,
        items: (currentItems || []).map((it) => ({
          id: String(it.id),
          name: it.name,
          price: Number(it.price) || 0,
          originalPrice: typeof it.originalPrice === 'number' ? it.originalPrice : (Number(it.price) || 0),
          image: it.image || '',
          quantity: Number(it.quantity) || 1,
        })),
      }
      await fetch('/api/cart/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // No-cache to ensure fresh write
      })
    } catch (e) {
      // Silent fail; local storage remains source of truth on client
      console.warn('[CART] Persist to server failed:', e)
    }
  }

  // Utility: normalize items to ensure required fields
  const normalizeItemsArr = (arr: CartItem[]): CartItem[] => {
    try {
      return (arr || []).map((it: any) => ({
        ...it,
        originalPrice: typeof it?.originalPrice === 'number' && !Number.isNaN(it.originalPrice)
          ? it.originalPrice
          : Number(it?.price) || 0,
        price: Number(it?.price) || 0,
        quantity: Number(it?.quantity) || 1,
      }))
    } catch {
      return arr || []
    }
  }

  // Load cart when user context changes (per-user persistence) and on mount
  useEffect(() => {
    try {
      const readCart = (key: string) => {
        const raw = localStorage.getItem(key)
        if (!raw) return [] as CartItem[]
        try { return JSON.parse(raw) as CartItem[] } catch { return [] as CartItem[] }
      }

      const readBackup = () => {
        try {
          const raw = sessionStorage.getItem('cartBackup')
          if (!raw) return [] as CartItem[]
          return JSON.parse(raw) as CartItem[]
        } catch {
          return [] as CartItem[]
        }
      }

      const savedGlobal = readCart('cart')
      const savedGuest = readCart('cart:guest')
      const savedUser = userEmail ? readCart(`cart:${userEmail}`) : []
      const backup = readBackup()

      if (userEmail) {
        // Merge user + guest + legacy global; user takes precedence
        const map = new Map<string, CartItem>()
        const pushAll = (arr: CartItem[]) => {
          for (const it of arr || []) {
            if (!it) continue
            const key = String(it.id)
            if (!map.has(key)) map.set(key, it)
          }
        }
        pushAll(savedUser)
        pushAll(savedGuest)
        pushAll(savedGlobal)
        let merged = normalizeItemsArr(Array.from(map.values()))
        if ((merged?.length ?? 0) === 0 && backup.length) {
          merged = normalizeItemsArr(backup)
        }
        setItems(merged)
        localStorage.setItem(storageKey, JSON.stringify(merged))
        localStorage.removeItem('cart:guest')
        localStorage.setItem('cart', JSON.stringify(merged))
      } else {
        // Not logged in: use guest cart, fallback to legacy global
        const source = savedGuest.length ? savedGuest : savedGlobal
        const finalSource = normalizeItemsArr(((source?.length ?? 0) === 0 && backup.length ? backup : source) as CartItem[])
        setItems(finalSource)
        localStorage.setItem(storageKey, JSON.stringify(finalSource))
        localStorage.setItem('cart', JSON.stringify(finalSource))
      }
      // Clear backup after usage to avoid stale data
      try { sessionStorage.removeItem('cartBackup') } catch {}
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
      localStorage.removeItem(storageKey)
      setItems([])
    }
    // Mark as hydrated so subsequent effects (like saver) can run safely
    hydratedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Late rehydrate: if items somehow become empty, try restoring from any available storage
  useEffect(() => {
    if (items.length > 0) return
    try {
      const emailKey = (user?.email || '').trim().toLowerCase()
      const userKey = emailKey ? `cart:${emailKey}` : ''
      const candidates = [
        userKey,
        'cart:guest',
        'cart',
      ].filter(Boolean) as string[]
      for (const key of candidates) {
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const parsed = normalizeItemsArr(JSON.parse(raw))
            if (parsed && parsed.length) {
              setItems(parsed)
              break
            }
          }
        } catch {}
      }
    } catch {}
  }, [items.length, user])

  // Save cart to localStorage whenever items change (both current key and legacy 'cart')
  useEffect(() => {
    // Do not save on the very first mount before we've hydrated from storage
    if (!hydratedRef.current) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(items))
      localStorage.setItem('cart', JSON.stringify(items))
    } catch (error) {
      console.error("Error saving cart to localStorage:", error)
    }
  }, [items, storageKey])

  // On login or when userEmail changes, fetch server cart and merge with local
  useEffect(() => {
    if (!userEmail) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/cart/get?email=${encodeURIComponent(userEmail)}`, { cache: 'no-store' })
        const json = await res.json().catch(() => ({ success: false, data: [] }))
        if (!json?.success || cancelled) return
        const serverItems = normalizeItemsArr(json.data || [])

        // Merge: prefer existing client items quantities, add missing from server
        const map = new Map<string, CartItem>()
        for (const it of items) {
          map.set(String(it.id), it)
        }
        for (const it of serverItems) {
          const key = String(it.id)
          if (!map.has(key)) map.set(key, it)
        }
        const merged = normalizeItemsArr(Array.from(map.values()))

        // If merged differs from current items, update state and storage, then persist back to server
        const same = JSON.stringify(merged) === JSON.stringify(items)
        if (!same) {
          setItems(merged)
          try {
            localStorage.setItem(storageKey, JSON.stringify(merged))
            localStorage.setItem('cart', JSON.stringify(merged))
          } catch {}
          // Persist merged view to server ensuring both sides are in sync
          await persistServerCart(userEmail, merged)
        }
      } catch (e) {
        console.warn('[CART] Failed to fetch server cart:', e)
      }
    })()
    return () => { cancelled = true }
    // Only run when email changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail])

  // Debounced save to server whenever items change for logged-in user
  useEffect(() => {
    if (!userEmail) return
    const t = setTimeout(() => {
      persistServerCart(userEmail, items)
    }, 600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, userEmail])

  const addToCart = (product: Omit<CartItem, "quantity">) => {
    console.log("🛒 [CART] Add to cart called with:", product)
    console.log("🛒 [CART] Product details:", {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    })

    try {
      // Normalize product to ensure originalPrice fallback
      const normalizedProduct = {
        ...product,
        originalPrice: typeof product.originalPrice === 'number' && !Number.isNaN(product.originalPrice)
          ? product.originalPrice
          : Number(product.price) || 0,
      }

      // Compute next items synchronously using current state
      const exists = items.find((it) => String(it.id) === String(normalizedProduct.id))
      const nextItems: CartItem[] = exists
        ? items.map((it) => String(it.id) === String(normalizedProduct.id) ? { ...it, quantity: (it.quantity || 0) + 1 } : it)
        : [...items, { ...(normalizedProduct as any), quantity: 1 }]

      // Update state immediately
      setItems(nextItems)

      // Persist synchronously to prevent loss on fast navigation
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextItems))
        localStorage.setItem('cart', JSON.stringify(nextItems))
        if (!userEmail) localStorage.setItem('cart:guest', JSON.stringify(nextItems))
        sessionStorage.setItem('cartBackup', JSON.stringify(nextItems))
      } catch {}
      
      const isMobile = typeof window !== 'undefined' && (window.innerWidth < 640 || (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 640px)').matches))
      if (!isMobile) {
        // Show animated, colorful, clickable toast notification (desktop/tablet only)
        console.log("🛒 [CART] Showing toast notification for:", normalizedProduct.name)
        let dismissToastFn: (() => void) | null = null
        const goToCart = () => {
          try {
            // Reinforce persistence right before navigation
            localStorage.setItem(storageKey, JSON.stringify(nextItems))
            localStorage.setItem('cart', JSON.stringify(nextItems))
            if (!userEmail) localStorage.setItem('cart:guest', JSON.stringify(nextItems))
            sessionStorage.setItem('cartBackup', JSON.stringify(nextItems))
          } catch {}
          try { dismissToastFn?.() } catch {}
          try { router.push('/cart') } catch { window.location.href = '/cart' }
        }
        const toastHandle = toast({
          title: "কার্টে যোগ করা হয়েছে",
          description: (
            <div className="flex items-center gap-3">
              {normalizedProduct.image ? (
                <img
                  src={normalizedProduct.image}
                  alt={normalizedProduct.name}
                  className="w-8 h-8 rounded-md object-cover ring-1 ring-white/40"
                />
              ) : null}
              <div className="leading-tight">
                <div className="font-medium">{normalizedProduct.name}</div>
                <div className="text-xs opacity-90">ট্যাপ করুন কার্ট দেখুন</div>
              </div>
            </div>
          ),
          className:
            "cursor-pointer border-0 text-white shadow-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-cyan-500 hover:from-emerald-600 hover:via-green-600 hover:to-cyan-600 transition-transform will-change-transform hover:scale-[1.02] ring-2 ring-white/10",
          onClick: goToCart,
          action: (
            <ToastAction
              altText="View cart"
              onClick={goToCart}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              কার্ট দেখুন
            </ToastAction>
          ),
        })
        dismissToastFn = toastHandle.dismiss
        console.log("🛒 [CART] Toast notification triggered successfully")
      }
    } catch (error) {
      console.error("🛒 [CART] Error adding to cart:", error)
      const isMobile = typeof window !== 'undefined' && (window.innerWidth < 640 || (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 640px)').matches))
      if (!isMobile) {
        toast({
          title: "ত্রুটি",
          description: "কার্টে যোগ করতে ব্যর্থ, আবার চেষ্টা করুন",
          variant: "destructive",
        })
      }
    }
  }

  const removeFromCart = (id: string | number) => {
    const item = items.find((it) => String(it.id) === String(id))
    const nextItems = items.filter((it) => String(it.id) !== String(id))
    setItems(nextItems)
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextItems))
      localStorage.setItem('cart', JSON.stringify(nextItems))
      if (!userEmail) localStorage.setItem('cart:guest', JSON.stringify(nextItems))
      sessionStorage.setItem('cartBackup', JSON.stringify(nextItems))
    } catch {}
    if (item) {
      const isMobile = typeof window !== 'undefined' && (window.innerWidth < 640 || (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 640px)').matches))
      if (!isMobile) {
        toast({
          title: "কার্ট থেকে সরানো হয়েছে",
          description: `${item.name} কার্ট থেকে সরিয়ে দেওয়া হয়েছে`,
        })
      }
    }
  }

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    const nextItems = items.map((it) => (String(it.id) === String(id) ? { ...it, quantity } : it))
    setItems(nextItems)
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextItems))
      localStorage.setItem('cart', JSON.stringify(nextItems))
      if (!userEmail) localStorage.setItem('cart:guest', JSON.stringify(nextItems))
      sessionStorage.setItem('cartBackup', JSON.stringify(nextItems))
    } catch {}
  }

  const clearCart = () => {
    // Update state
    setItems([])
    // Persist clear to storages immediately so items don't reappear after navigation/refresh
    try {
      // Clear current scope key
      localStorage.setItem(storageKey, JSON.stringify([]))
      // Also clear legacy/global keys
      localStorage.setItem('cart', JSON.stringify([]))
      localStorage.setItem('cart:guest', JSON.stringify([]))
      if (userEmail) {
        localStorage.setItem(`cart:${userEmail}`, JSON.stringify([]))
      }
      // Remove backup so rehydrate effect can't restore old items
      sessionStorage.removeItem('cartBackup')
    } catch {}

    // Also clear server-side cart snapshot for this user (fire-and-forget)
    if (userEmail) {
      persistServerCart(userEmail, [])
    }

    toast({
      title: "কার্ট খালি করা হয়েছে",
      description: "সমস্ত পণ্য কার্ট থেকে সরিয়ে দেওয়া হয়েছে",
    })
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
