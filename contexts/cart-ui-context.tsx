"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

interface CartUIContextType {
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartUIContext = createContext<CartUIContextType | undefined>(undefined)

export function CartUIProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false)

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])
  const toggleCart = useCallback(() => setIsCartOpen((v) => !v), [])

  return (
    <CartUIContext.Provider value={{ isCartOpen, openCart, closeCart, toggleCart }}>
      {children}
    </CartUIContext.Provider>
  )
}

export function useCartUI() {
  const ctx = useContext(CartUIContext)
  if (!ctx) throw new Error("useCartUI must be used within a CartUIProvider")
  return ctx
}
