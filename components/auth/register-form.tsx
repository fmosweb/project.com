"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Phone, Lock, Mail, AlertCircle, CheckCircle, Shield } from "lucide-react"

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onRegistrationSuccess: (mobile: string, email?: string) => void
}

export default function RegisterForm({ onSwitchToLogin, onRegistrationSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    otp: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [otpSent, setOtpSent] = useState(false)
  const [otpGenerated, setOtpGenerated] = useState("")
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const widgetIdRef = useRef<number | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
  const isCaptchaRequired = Boolean(siteKey)

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    console.log("[v1] Validating form data:", formData)
    
    // Name validation
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "নাম প্রয়োজন"
      console.log("[v1] Name validation failed: empty")
    } else if (formData.name.length < 2) {
      errors.name = "নাম কমপক্ষে ২ অক্ষর হতে হবে"
      console.log("[v1] Name validation failed: too short")
    }
    
    // Email validation
    if (!formData.email || formData.email.trim() === "") {
      errors.email = "ইমেইল প্রয়োজন"
      console.log("[v1] Email validation failed: empty")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "সঠিক ইমেইল ঠিকানা দিন"
      console.log("[v1] Email validation failed: invalid format")
    }
    
    // Mobile validation
    if (!formData.mobile || formData.mobile.trim() === "") {
      errors.mobile = "মোবাইল নম্বর প্রয়োজন"
      console.log("[v1] Mobile validation failed: empty")
    } else if (!/^01[3-9]\d{8}$/.test(formData.mobile)) {
      errors.mobile = "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)"
      console.log("[v1] Mobile validation failed: invalid format")
    }
    
    // Password validation
    if (!formData.password || formData.password.trim() === "") {
      errors.password = "পাসওয়ার্ড প্রয়োজন"
      console.log("[v1] Password validation failed: empty")
    } else if (formData.password.length < 6) {
      errors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে"
      console.log("[v1] Password validation failed: too short")
    }
    
    // OTP validation (only if OTP has been sent)
    if (otpSent) {
      if (!formData.otp || formData.otp.trim() === "") {
        errors.otp = "OTP কোড প্রয়োজন"
        console.log("[v1] OTP validation failed: empty")
      } else if (formData.otp.length !== 6) {
        errors.otp = "সঠিক ৬ সংখ্যার OTP কোড দিন"
        console.log("[v1] OTP validation failed: wrong length")
      }
    }
    
    console.log("[v1] Validation errors:", errors)
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v1] Form submitted!")
    console.log("[v1] Current formData:", formData)
    setLoading(true)
    setError("")
    setSuccess("")
    setFieldErrors({})

    // Validate form
    const validationErrors = validateForm()
    console.log("[v1] Validation errors from validateForm:", validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      console.log("[v1] Form validation failed:", validationErrors)
      setFieldErrors(validationErrors)
      setLoading(false)
      return
    }
    
    console.log("[v1] Form validation passed")

    try {
      if (!otpSent) {
        // Require captcha for registration if configured
        if (isCaptchaRequired && !recaptchaToken) {
          setError("দয়া করে reCAPTCHA যাচাই সম্পূর্ণ করুন")
          setLoading(false)
          return
        }
        // First step: Send OTP
        console.log("[v1] Sending OTP request:", { email: formData.email })
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            password: formData.password,
            recaptchaToken,
          }),
        })

        const data = await response.json()
        console.log("[v1] OTP response:", { status: response.status, data })

        if (response.ok) {
          setSuccess("আপনার ইমেইলে OTP কোড পাঠানো হয়েছে। অনুগ্রহ করে OTP কোড দিন।")
          setOtpSent(true)
          setOtpGenerated(data.otp || "Check server console")
        } else {
          setError(data.message || "OTP পাঠানো ব্যর্থ হয়েছে")
        }
      } else {
        // Second step: Verify OTP and create account
        console.log("[v1] Verifying OTP and creating account:", { email: formData.email, otp: formData.otp })
        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp
          }),
        })

        const data = await response.json()
        console.log("[v1] Verification response:", { status: response.status, data })

        if (response.ok) {
          setSuccess("আপনার একাউন্ট সফলভাবে তৈরি হয়েছে!")
          onRegistrationSuccess(formData.mobile, formData.email)
        } else {
          setError(data.message || "OTP যাচাইকরণ ব্যর্থ হয়েছে")
        }
      }
    } catch (err) {
      console.log("[v1] Request error:", err)
      setError("নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।")
    } finally {
      setLoading(false)
    }
  }

  // Load reCAPTCHA script and render widget for registration first step
  useEffect(() => {
    if (!siteKey) return
    const id = "recaptcha-script"
    const existing = document.getElementById(id) as HTMLScriptElement | null

    const renderWidget = () => {
      const w: any = window as any
      if (!w.grecaptcha) return
      w.grecaptcha.ready(() => {
        const el = document.getElementById("register-recaptcha")
        if (el && widgetIdRef.current === null) {
          widgetIdRef.current = w.grecaptcha.render("register-recaptcha", {
            sitekey: siteKey,
            callback: (token: string) => setRecaptchaToken(token),
            "expired-callback": () => setRecaptchaToken(null),
            theme: "light",
            size: "normal",
            type: "image",
          })
        }
      })
    }

    if (existing) {
      if ((window as any).grecaptcha) {
        renderWidget()
      } else {
        const onLoadExisting = () => renderWidget()
        existing.addEventListener("load", onLoadExisting)
        return () => existing.removeEventListener("load", onLoadExisting)
      }
      return
    }

    const script = document.createElement("script")
    script.id = id
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit"
    script.async = true
    script.defer = true
    const onLoad = () => renderWidget()
    script.addEventListener("load", onLoad)
    document.body.appendChild(script)
    return () => {
      script.removeEventListener("load", onLoad)
    }
  }, [siteKey])

  const handleResendOtp = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("নতুন OTP কোড পাঠানো হয়েছে")
        setOtpGenerated(data.otp || "Check server console")
      } else {
        setError(data.message || "OTP পুনরায় পাঠানো ব্যর্থ হয়েছে")
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
        <CardTitle className="text-2xl font-bold">Register</CardTitle>
        <CardDescription>Create your account to get started</CardDescription>
      </CardHeader>
      <CardContent>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (fieldErrors.name) {
                    setFieldErrors({ ...fieldErrors, name: "" })
                  }
                }}
                className={`pl-10 ${fieldErrors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                required
                disabled={otpSent}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (fieldErrors.email) {
                    setFieldErrors({ ...fieldErrors, email: "" })
                  }
                }}
                className={`pl-10 ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                required
                disabled={otpSent}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
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
                disabled={otpSent}
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
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  if (fieldErrors.password) {
                    setFieldErrors({ ...fieldErrors, password: "" })
                  }
                }}
                className={`pl-10 ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                required
                minLength={6}
                disabled={otpSent}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          {otpSent && (
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Verification Code</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP code"
                  value={formData.otp}
                  onChange={(e) => {
                    setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })
                    if (fieldErrors.otp) {
                      setFieldErrors({ ...fieldErrors, otp: "" })
                    }
                  }}
                  className="pl-10 text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              {fieldErrors.otp && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.otp}
                </p>
              )}
              <p className="text-sm text-gray-600">
                OTP কোডটি {formData.email} এ পাঠানো হয়েছে
              </p>
              {otpGenerated && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  <strong>Test OTP:</strong> {otpGenerated}
                </p>
              )}
            </div>
          )}

          {/* reCAPTCHA widget (first step only) */}
          {!otpSent && (
            siteKey ? (
              <div className="mt-2">
                <p className="text-xs text-gray-600 text-center mb-2">Security check</p>
                <div className="flex justify-center">
                  <div id="register-recaptcha" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-2 text-center">reCAPTCHA disabled: set NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY in .env.local</p>
            )
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading || (!otpSent && isCaptchaRequired && !recaptchaToken)}>
              {loading ? (otpSent ? "Verifying..." : "Sending OTP...") : 
               (otpSent ? "Verify OTP & Create Account" : "Send OTP")}
            </Button>
            {otpSent && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleResendOtp} 
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend OTP"}
              </Button>
            )}
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
