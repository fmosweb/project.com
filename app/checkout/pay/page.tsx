"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertCircle, CreditCard } from "lucide-react"

type GatewayKey = "bkash" | "nagad" | "rocket"

export default function PayPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => { setHasMounted(true) }, [])

  const orderId = hasMounted ? (searchParams.get("orderId") || "") : ""
  const amountParam = hasMounted ? (searchParams.get("amount") || "") : ""
  const amount = hasMounted ? (Number(amountParam) || 0) : 0

  const [method, setMethod] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [availability, setAvailability] = useState<{ bkash: boolean; nagad: boolean; rocket: boolean } | null>(null)

  const isMethodAvailable = (m: GatewayKey) => {
    if (!availability) return true
    return availability[m]
  }

  // Fetch payment availability. If none available, go back to checkout with forceCOD.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/payment/availability', { cache: 'no-store' })
        const data = await res.json()
        if (cancelled) return
        setAvailability(data?.gateways ?? null)
        if (!data?.onlineAvailable) {
          router.push('/checkout?forceCOD=1')
        }
      } catch {
        // ignore network errors; let user try again
      }
    })()
    return () => { cancelled = true }
  }, [router])

  const handleProceed = async () => {
    setError("")
    if (!orderId || !amount) {
      setError("অর্ডার তথ্য পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।")
      return
    }
    if (!method) {
      setError("অনুগ্রহ করে একটি পেমেন্ট গেটওয়ে নির্বাচন করুন")
      return
    }
    if (!isMethodAvailable(method as GatewayKey)) {
      setError("নির্বাচিত পেমেন্ট গেটওয়ে বর্তমানে অনুপলব্ধ। অন্যটি চেষ্টা করুন অথবা Cash on Delivery ব্যবহার করুন।")
      return
    }

    try {
      setIsProcessing(true)
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, method, amount, customerInfo: {} }),
      })
      const data = await res.json()
      if (res.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        setError(data.error || "পেমেন্ট শুরু করতে ব্যর্থ হয়েছে")
      }
    } catch (e) {
      console.error("initiate error", e)
      setError("পেমেন্ট শুরু করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">অনলাইন পেমেন্ট নির্বাচন করুন</h1>
          <p className="text-sm text-gray-600 mt-1">অর্ডার আইডি: <span className="font-medium" suppressHydrationWarning>{hasMounted ? (orderId || "-") : "-"}</span> · মোট: <span className="font-semibold" suppressHydrationWarning>{hasMounted ? `TK${Math.round(amount).toLocaleString()}` : "TK-"}</span></p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-amber-600" />
              পেমেন্ট গেটওয়ে নির্বাচন করুন
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            <RadioGroup value={method} onValueChange={setMethod}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* bKash */}
                <div className="relative">
                  <RadioGroupItem value="bkash" id="bkash" className="sr-only" disabled={availability ? !availability.bkash : false} />
                  <Label htmlFor="bkash" className={`flex flex-col items-center p-6 border-2 rounded-xl transition-all duration-200 group ${
                    method === "bkash" ? "border-pink-500 bg-pink-50" : "border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                  } ${availability && !availability.bkash ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                      method === "bkash" ? "bg-pink-200" : "bg-pink-100 group-hover:bg-pink-200"
                    }`}>
                      <span className="text-pink-600 font-bold text-lg">bK</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">bKash</h3>
                    <p className="text-sm text-gray-600 text-center">{availability && !availability.bkash ? "উপলব্ধ নয়" : "মোবাইল পেমেন্ট"}</p>
                  </Label>
                </div>

                {/* Nagad */}
                <div className="relative">
                  <RadioGroupItem value="nagad" id="nagad" className="sr-only" disabled={availability ? !availability.nagad : false} />
                  <Label htmlFor="nagad" className={`flex flex-col items-center p-6 border-2 rounded-xl transition-all duration-200 group ${
                    method === "nagad" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                  } ${availability && !availability.nagad ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                      method === "nagad" ? "bg-orange-200" : "bg-orange-100 group-hover:bg-orange-200"
                    }`}>
                      <span className="text-orange-600 font-bold text-lg">N</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Nagad</h3>
                    <p className="text-sm text-gray-600 text-center">{availability && !availability.nagad ? "উপলব্ধ নয়" : "মোবাইল পেমেন্ট"}</p>
                  </Label>
                </div>

                {/* Rocket */}
                <div className="relative">
                  <RadioGroupItem value="rocket" id="rocket" className="sr-only" disabled={availability ? !availability.rocket : false} />
                  <Label htmlFor="rocket" className={`flex flex-col items-center p-6 border-2 rounded-xl transition-all duration-200 group ${
                    method === "rocket" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  } ${availability && !availability.rocket ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                      method === "rocket" ? "bg-blue-200" : "bg-blue-100 group-hover:bg-blue-200"
                    }`}>
                      <span className="text-blue-600 font-bold text-lg">R</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Rocket</h3>
                    <p className="text-sm text-gray-600 text-center">{availability && !availability.rocket ? "উপলব্ধ নয়" : "মোবাইল পেমেন্ট"}</p>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleProceed} className="bg-amber-600 hover:bg-amber-700" disabled={isProcessing || !method}>
                {isProcessing ? "Processing..." : "Proceed to Payment"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.push("/checkout")}>চেকআউটে ফিরুন</Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
