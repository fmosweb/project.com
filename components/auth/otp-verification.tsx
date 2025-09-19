"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle, CheckCircle } from "lucide-react"

interface OTPVerificationProps {
  mobile: string
  email?: string
  onVerificationSuccess: () => void
  onBack: () => void
}

export default function OTPVerification({ mobile, email, onVerificationSuccess, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resending, setResending] = useState(false)
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (otp.length !== 6) {
      setError("অনুগ্রহ করে ৬ অঙ্কের কোড দিন")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("ভেরিফিকেশন সফল! আপনার অ্যাকাউন্ট তৈরি হয়েছে।")
        setTimeout(() => {
          onVerificationSuccess()
        }, 1500)
      } else {
        setError(data.message || "ভুল কোড। আবার চেষ্টা করুন।")
      }
    } catch (err) {
      setError("নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResending(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSuccess("নতুন কোড পাঠানো হয়েছে। অনুগ্রহ করে চেক করুন।")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        setError(data.message || "কোড পাঠাতে ব্যর্থ। আবার চেষ্টা করুন।")
      }
    } catch (err) {
      setError("নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।")
    } finally {
      setResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Shield className="h-12 w-12 text-amber-600 mx-auto mb-2" />
        <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
        <CardDescription>Enter the 6-digit code sent to {email || mobile}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp">OTP Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                if (error) setError("")
              }}
              className={`text-center text-2xl tracking-widest ${error ? 'border-red-500 focus:border-red-500' : ''}`}
              maxLength={6}
              required
            />
            {otp.length > 0 && otp.length < 6 && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {6 - otp.length} more digits needed
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                {resending ? "Resending..." : "Resend OTP"}
              </button>
            </p>
            <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
              Back to Registration
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
