"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Phone, Lock, AlertCircle } from "lucide-react"

interface LoginFormProps {
  onSwitchToRegister: () => void
  onLoginSuccess: (user: any) => void
}

export default function LoginForm({ onSwitchToRegister, onLoginSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    // Mobile validation
    if (!formData.mobile) {
      errors.mobile = "মোবাইল নম্বর প্রয়োজন"
    } else if (!/^01[3-9]\d{8}$/.test(formData.mobile)) {
      errors.mobile = "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)"
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = "পাসওয়ার্ড প্রয়োজন"
    } else if (formData.password.length < 6) {
      errors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে"
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setFieldErrors({})

    // Validate form
    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        onLoginSuccess(data.user)
      } else {
        setError(data.message || "লগইন ব্যর্থ হয়েছে")
        // ভুল ইমেইল বা পাসওয়ার্ড হলে ফিল্ড এরর সেট করি
        if (data.message.includes("Invalid mobile") || data.message.includes("password")) {
          setFieldErrors({
            mobile: "মোবাইল নম্বর বা পাসওয়ার্ড ভুল",
            password: "মোবাইল নম্বর বা পাসওয়ার্ড ভুল"
          })
        }
      }
    } catch (err) {
      setError("নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">লগইন</CardTitle>
        <CardDescription>আপনার মোবাইল নম্বর এবং পাসওয়ার্ড দিন</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="mobile">মোবাইল নম্বর</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="mobile"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={formData.mobile}
                onChange={(e) => {
                  setFormData({ ...formData, mobile: e.target.value })
                  if (fieldErrors.mobile) {
                    setFieldErrors({ ...fieldErrors, mobile: "" })
                  }
                }}
                className={`pl-10 ${fieldErrors.mobile ? 'border-red-500 focus:border-red-500' : ''}`}
                required
              />
            </div>
            {fieldErrors.mobile && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.mobile}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">পাসওয়ার্ড</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="আপনার পাসওয়ার্ড দিন"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  if (fieldErrors.password) {
                    setFieldErrors({ ...fieldErrors, password: "" })
                  }
                }}
                className={`pl-10 ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                required
              />
            </div>
            {fieldErrors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              অ্যাকাউন্ট নেই?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                রেজিস্টার করুন
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
