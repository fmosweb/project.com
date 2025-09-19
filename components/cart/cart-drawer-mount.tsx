"use client"

import CartDrawer from "@/components/cart/cart-drawer"
import { useCartUI } from "@/contexts/cart-ui-context"

export default function CartDrawerMount() {
  const { isCartOpen, closeCart } = useCartUI()
  return <CartDrawer open={isCartOpen} onClose={closeCart} />
}
