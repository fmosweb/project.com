"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Shield, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function EmailLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawReturn = searchParams?.get("return") || ""
  const returnUrl = rawReturn && rawReturn.startsWith("/") ? rawReturn : "/checkout"
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Ensure guest cart persists while on login page
  useEffect(() => {
    try {
      const backup = sessionStorage.getItem('cartBackup')
      if (backup) {
        localStorage.setItem('cart', backup)
        localStorage.setItem('cart:guest', backup)
      }
    } catch {}
  }, [])

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("একটি বৈধ ইমেইল লিখুন")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/request-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "কোড পাঠাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।")
        return
      }
      setSuccess("ভেরিফিকেশন কোড আপনার ইমেইলে পাঠানো হয়েছে")
      setStep("otp")
    } catch (err) {
      setError("নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।")
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (otp.length !== 6) {
      setError("৬ সংখ্যার কোড দিন")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "ভুল বা মেয়াদোত্তীর্ণ কোড")
        return
      }

      // Persist minimal session for UI via localStorage so Header picks it up after reload
      if (data.user) {
        const user = {
          id: data.user.id,
          name: data.user.name || email.split("@")[0],
          email: data.user.email || email,
          phone: data.user.mobile || "",
        }
        localStorage.setItem("user", JSON.stringify(user))

        // Also persist cart for this user key, using any existing backup
        try {
          const backup = sessionStorage.getItem('cartBackup') || localStorage.getItem('cart:guest') || localStorage.getItem('cart')
          if (backup && user.email) {
            const key = `cart:${(user.email || '').trim().toLowerCase()}`
            localStorage.setItem(key, backup)
            localStorage.setItem('cart', backup)
          }
        } catch {}
      }

      setSuccess("লগইন সফল! রিডাইরেক্ট করা হচ্ছে...")
      setTimeout(() => {
        // Force full reload so AuthProvider reads localStorage, then land on intended page
        try {
          window.location.href = returnUrl
        } catch {
          window.location.href = "/checkout"
        }
      }, 1000)
    } catch (err) {
      setError("নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।")
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess("নতুন কোড পাঠানো হয়েছে")
      } else {
        setError(data.message || "কোড পাঠাতে ব্যর্থ")
      }
    } catch (err) {
      setError("নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।")
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="w-full rounded-2xl border border-amber-100/60 shadow-lg bg-white">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/fmosweb-logo.png"
                alt="FMOSWEB"
                width={406}
                height={182}
                priority
                sizes="200px"
                className="w-[200px] h-auto select-none"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Sign in</CardTitle>
            <p className="text-sm text-gray-800">Enter your email and we'll send you a verification code</p>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {step === "email" ? (
              <form onSubmit={requestOtp} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-900">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1 pl-10 pr-4 h-12 rounded-xl border-2 border-amber-500 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/60 focus:border-amber-600"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base shadow-md hover:shadow-lg bg-amber-500 hover:bg-amber-600 text-white" disabled={loading}>
                  {loading ? "Sending..." : "Continue"}
                </Button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div>
                  <Label htmlFor="otp" className="text-gray-900">Verify code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="mt-1 text-center tracking-widest text-2xl h-12 rounded-xl border-2 border-amber-500 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-amber-500/60 focus:border-amber-600"
                    maxLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base shadow-md hover:shadow-lg bg-amber-500 hover:bg-amber-600 text-white" disabled={loading || otp.length !== 6}>
                  {loading ? (
                    <span className="inline-flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify"
                  )}
                </Button>
                <div className="text-center text-sm text-gray-600">
                  Didn't receive the code? {" "}
                  <button type="button" onClick={resendOtp} className="text-amber-600 hover:text-amber-700 font-medium">
                    Resend
                  </button>
                </div>
                
              </form>
            )}
          </CardContent>
        </Card>
        <div className="text-center mt-4 text-xs text-gray-500">
          <a href="/terms" className="text-amber-600 hover:text-amber-700">Terms of service</a>
        </div>
      </div>
    </div>
  )
}
