"use client"

import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Package, Truck, Mail } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useCart } from "@/contexts/cart-context"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderIdParam = searchParams.get("orderId")
  const methodParam = searchParams.get("method")
  const { clearCart } = useCart()

  useEffect(() => {
    // Clear cart once upon visiting success page
    clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const orderNumber = orderIdParam || ("FMOS" + Math.random().toString(36).substr(2, 9).toUpperCase())
  const paymentMethod = (() => {
    if (!methodParam) return "N/A"
    const m = methodParam.toLowerCase()
    if (m === "cod" || m === "cash_on_delivery" || m === "cash-on-delivery") return "Cash on Delivery"
    if (m === "bkash") return "bKash"
    if (m === "nagad") return "Nagad"
    if (m === "rocket") return "Rocket"
    return methodParam
  })()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-2">Thank you for your purchase</p>
          <p className="text-gray-600">
            Your order <span className="font-semibold">#{orderNumber}</span> has been successfully placed
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Confirmation Email</h3>
              <p className="text-sm text-gray-600">We've sent a confirmation email with your order details</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Processing</h3>
              <p className="text-sm text-gray-600">Your order is being prepared for shipment</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Truck className="h-8 w-8 text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Shipping</h3>
              <p className="text-sm text-gray-600">Expected delivery in 5-7 business days</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-semibold">#{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span>{paymentMethod}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">Continue Shopping</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@fmosweb.com" className="text-amber-600 hover:underline">
              support@fmosweb.com
            </a>
          </p>
        </div>
      </main>

      <Footer />
      <div className="h-16 md:hidden" />
    </div>
  )
}
