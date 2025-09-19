"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Shield, ArrowLeft } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const widgetIdRef = useRef<number | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
  const isCaptchaRequired = Boolean(siteKey)
  const canSubmit = !isLoading && (!isCaptchaRequired || !!recaptchaToken)

  // Load reCAPTCHA script and render widget
  useEffect(() => {
    if (!siteKey) return
    const id = "recaptcha-script"
    const existing = document.getElementById(id) as HTMLScriptElement | null

    const renderWidget = () => {
      const w: any = window as any
      if (!w.grecaptcha) return
      w.grecaptcha.ready(() => {
        const el = document.getElementById("admin-recaptcha")
        if (el && widgetIdRef.current === null) {
          widgetIdRef.current = w.grecaptcha.render("admin-recaptcha", {
            sitekey: siteKey,
            callback: (token: string) => setRecaptchaToken(token),
            "expired-callback": () => setRecaptchaToken(null),
            theme: "light",
            size: "normal",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isCaptchaRequired && !recaptchaToken) {
        alert("Please complete the reCAPTCHA security check")
        setIsLoading(false)
        return
      }
      console.log("[v0] Starting admin login with:", formData.email)

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          recaptchaToken,
        }),
      })

      console.log("[v0] Login response status:", response.status)
      const data = await response.json()
      console.log("[v0] Login response data:", data)

      if (response.ok) {
        console.log("[v0] Login successful (cookie session set by server)")
        console.log("[v0] Redirecting to admin dashboard")
        router.push("/admin")
      } else {
        console.error("[v0] Login failed:", data.message)
        alert(data.message || "Login failed")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      alert("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Website
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Admin Access</CardTitle>
            <p className="text-gray-600">Sign in to FMOSWEB Admin Panel</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-start">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Keep me signed in
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
                disabled={!canSubmit}
              >
                {isLoading ? "Signing in..." : "Access Admin Panel"}
              </Button>

              {/* reCAPTCHA widget */}
              {siteKey ? (
                <div className="mt-4">
                  <p className="text-xs text-gray-600 text-center mb-2">Security check</p>
                  <div className="flex justify-center">
                    <div id="admin-recaptcha" />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-4 text-center">
                  reCAPTCHA disabled: set NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY in .env.local
                </p>
              )}
            </form>

            {/* Demo credentials removed as requested */}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">This is a secure admin area. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  )
}
