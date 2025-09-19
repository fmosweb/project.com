"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
type UIOrder = {
  id: string
  date: string
  status: string
  total: number
  items: { name: string; quantity: number; price: number }[]
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [orders, setOrders] = useState<UIOrder[]>([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<UIOrder | null>(null)

  const getStatusDisplay = (status: string) => {
    const s = String(status || '').toLowerCase()
    if (s === 'delivered') return 'ডেলিভার্ড'
    if (s === 'confirmed' || s === 'shipped') return 'ডেলিভারির জন্য পাঠানো হয়েছে'
    if (s === 'cancelled') return 'বাতিল'
    // pending or processing
    return 'প্রসেসিং'
  }

  const getBadgeVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    const s = String(status || '').toLowerCase()
    if (s === 'delivered') return 'default'
    if (s === 'confirmed' || s === 'shipped') return 'secondary'
    return 'outline'
  }

  const fetchOrders = async (email: string, phone?: string) => {
    try {
      const phoneParam = phone ? `&phone=${encodeURIComponent(phone)}` : ''
      const res = await fetch(`/api/account/orders?email=${encodeURIComponent(email)}${phoneParam}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        setOrders([])
        return
      }
      const mapped: UIOrder[] = (json.data || []).map((o: any) => ({
        id: o.id,
        date: o.created_at,
        status: o.status,
        total: Number(o.total_amount) || 0,
        items: (o.items || []).map((it: any) => ({ name: it?.product?.name || 'Product', quantity: Number(it.quantity) || 0, price: Number(it.price) || 0 }))
      }))
      setOrders(mapped)
    } catch (e) {
      setOrders([])
    }
  }

  const getLocalPhone = () => {
    try {
      return localStorage.getItem('last_checkout_phone') || ''
    } catch {
      return ''
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    const email = user?.email || ''
    const phone = user?.phone || getLocalPhone()
    if (email || phone) {
      fetchOrders(email, phone)
    }
  }, [isAuthenticated, user?.email, user?.phone])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10">
        <p>Please log in to view your orders.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            try {
              if (typeof window !== 'undefined' && window.history.length > 1) router.back()
              else router.push('/account')
            } catch {
              router.push('/account')
            }
          }}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Orders</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Here is a list of your past and current orders.
      </p>

      {orders.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No orders yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You have not placed any orders.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Order {order.id}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(order.status)}>
                    {getStatusDisplay(order.status)}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelected(order)
                      setOpen(true)
                    }}
                  >
                    View details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                  <span>Date: {new Date(order.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="font-semibold">
                    Total: TK{order.total.toFixed(2)}
                  </span>
                </div>
                <Separator />
                <ul className="mt-4 space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>TK{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details {selected ? `#${selected.id}` : ''}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Status</span>
                <span className="font-medium">{getStatusDisplay(selected.status)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Date</span>
                <span className="font-medium">{new Date(selected.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <ul className="space-y-1">
                  {selected.items.length === 0 ? (
                    <li className="text-sm text-muted-foreground">কোন আইটেম পাওয়া যায়নি</li>
                  ) : (
                    selected.items.map((it, i) => (
                      <li key={i} className="flex justify-between text-sm">
                        <span>{it.name} (x{it.quantity})</span>
                        <span>TK{(it.price * it.quantity).toFixed(2)}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>TK{selected.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
