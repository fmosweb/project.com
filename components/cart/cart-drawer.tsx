"use client"

import { useEffect } from "react"
import { X, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart()
  const router = useRouter()

  // Prevent body scroll when open
  useEffect(() => {
    const body = document.body
    if (open) {
      body.style.overflow = "hidden"
    } else {
      body.style.overflow = ""
    }
    return () => { body.style.overflow = "" }
  }, [open])

  const subtotal = getTotalPrice()
  const gotoPlaceOrder = () => {
    onClose()
    router.push("/checkout")
  }

  return (
    <div className={`fixed inset-0 z-[100] ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute right-0 top-0 h-full w-[88vw] sm:w-[420px] bg-white shadow-2xl border-l transform transition-transform duration-300 ease-out flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <button aria-label="Close cart" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-auto px-3 py-3 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-12">কার্ট খালি</div>
          ) : (
            items.map((it) => (
              <div key={String(it.id)} className="flex gap-3">
                <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border bg-white">
                  <img src={it.image || "/placeholder.svg"} alt={it.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 line-clamp-2">{it.name}</div>
                  <div className="text-sm text-gray-700 mt-0.5">Tk {Number(it.price).toLocaleString("en-BD")}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="inline-flex items-center bg-gray-100 rounded-md">
                      <button
                        className="px-2 py-1 text-gray-700 hover:text-gray-900"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(it.id, Math.max(1, (it.quantity || 1) - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-2 text-sm min-w-[1.5rem] text-center">{it.quantity}</span>
                      <button
                        className="px-2 py-1 text-gray-700 hover:text-gray-900"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(it.id, (it.quantity || 1) + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      className="text-sm text-gray-500 hover:text-red-600 inline-flex items-center gap-1"
                      onClick={() => removeFromCart(it.id)}
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t p-3 space-y-3">

          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">Tk {subtotal.toLocaleString("en-BD")}</span>
          </div>

          {/* Place Order */}
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-xl btn-pulse-glow btn-shine btn-wiggle-soft"
            onClick={gotoPlaceOrder}
            disabled={items.length === 0}
          >
            Place Order
          </Button>
        </div>
      </aside>
    </div>
  )
}
