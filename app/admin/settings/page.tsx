"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Eye, EyeOff, Settings, Key, ShieldAlert, Mail, Lock } from "lucide-react"

export default function AdminSettingsPage() {
  const router = useRouter()
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    newEmail: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [step, setStep] = useState<"verify" | "update">("verify")
  const [verifiedOld, setVerifiedOld] = useState("")
  const [verifyError, setVerifyError] = useState("")
  const [emailLocked, setEmailLocked] = useState(false)
  const [updateError, setUpdateError] = useState("")

  // Load current admin email from session
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store", credentials: "include" })
        const json = await res.json().catch(() => ({}))
        if (mounted && res.ok && json?.admin?.email) {
          setFormData((prev) => ({ ...prev, email: json.admin.email }))
          setEmailLocked(true)
        }
      } catch {}
    })()
    return () => { mounted = false }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Step 1: verify current password only
    if (step === "verify") {
      const oldP = (formData.oldPassword || "").trim()
      if (!oldP) {
        toast({
          title: "বর্তমান পাসওয়ার্ড দিন",
          description: "পরবর্তী ধাপে যেতে বর্তমান পাসওয়ার্ড প্রয়োজন",
          variant: "destructive",
        })
        return
      }
      setIsLoading(true)
      try {
        setVerifyError("")
        const res = await fetch("/api/admin/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: formData.email, oldPassword: oldP, verifyOnly: true }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          toast({ title: "ভেরিফাইড", description: "এখন নতুন ইমেইল/পাসওয়ার্ড দিন এবং আপডেট করুন" })
          setVerifiedOld(oldP)
          setStep("update")
          setFormData((prev) => ({ ...prev, oldPassword: "" }))
        } else {
          const msg = String(data?.message || "বর্তমান পাসওয়ার্ড সঠিক নয়")
          toast({ title: "ভেরিফিকেশন ব্যর্থ", description: msg, variant: "destructive" })
          setVerifyError(
            msg === "No admin email in session or request"
              ? "ইমেইল পাওয়া যায়নি। অনুগ্রহ করে উপরের ইমেইল ঘরে আপনার অ্যাডমিন ইমেইল লিখুন।"
              : msg === "Unauthorized"
                ? "সেশন মেয়াদ শেষ বা অননুমোদিত। অনুগ্রহ করে আবার লগইন করুন।"
                : msg
          )
        }
      } catch (error) {
        toast({ title: "ত্রুটি", description: "ভেরিফিকেশন করতে সমস্যা হয়েছে", variant: "destructive" })
        setVerifyError("ভেরিফিকেশন করতে সমস্যা হয়েছে")
      } finally {
        setIsLoading(false)
      }
      return
    }

    const ne = (formData.newEmail || "").trim()
    const oldP = (formData.oldPassword || "").trim()
    const newP = (formData.newPassword || "").trim()
    const confP = (formData.confirmPassword || "").trim()
    const changingEmail = !!ne
    const changingPassword = !!newP || !!confP

    if (step === "update" && !verifiedOld) {
      const msg = "ভেরিফিকেশন সেশন শেষ হয়েছে। অনুগ্রহ করে আবার বর্তমান পাসওয়ার্ড দিয়ে ভেরিফাই করুন।"
      setUpdateError(msg)
      toast({ title: "সেশন শেষ", description: "আবার ভেরিফাই করুন", variant: "destructive" })
      setVerifyError(msg)
      setStep("verify")
      return
    }

    if (!changingEmail && !changingPassword) {
      toast({
        title: "কোন পরিবর্তন নেই",
        description: "ইমেইল বা পাসওয়ার্ডের যেকোনো একটি পরিবর্তন করুন",
      })
      return
    }

    if (changingPassword) {
      if (newP !== confP) {
        toast({
          title: "পাসওয়ার্ড মিলেনি",
          description: "নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড একই হতে হবে",
          variant: "destructive",
        })
        return
      }
      if (newP.length < 6) {
        toast({
          title: "পাসওয়ার্ড ছোট",
          description: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)

    try {
      const payload: any = {
        email: formData.email,
        oldPassword: verifiedOld || oldP,
      }
      if (changingPassword) payload.newPassword = newP
      if (ne) payload.newEmail = ne

      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "সফল",
          description: data?.message || (ne && !changingPassword ? "ইমেইল সফলভাবে আপডেট হয়েছে" : "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে"),
        })
        setFormData({
          email: data.updatedEmail || formData.email,
          newEmail: "",
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        setVerifiedOld("")
        setStep("verify")
        setUpdateError("")
      } else {
        toast({
          title: "ব্যর্থ",
          description: data?.message || "পাসওয়ার্ড/ইমেইল পরিবর্তন ব্যর্থ",
          variant: "destructive",
        })
        setUpdateError(String(data?.message || "পাসওয়ার্ড/ইমেইল পরিবর্তন ব্যর্থ"))
      }
    } catch (error) {
      console.error("[v0] Password change error:", error)
      toast({
        title: "ত্রুটি",
        description: "পাসওয়ার্ড/ইমেইল পরিবর্তন ব্যর্থ। আবার চেষ্টা করুন।",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  // Developer icon triple-click detection (within 600ms)
  const devClickCountRef = useRef(0)
  const devClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleDevIconClick = () => {
    devClickCountRef.current += 1
    if (devClickTimerRef.current) clearTimeout(devClickTimerRef.current)
    devClickTimerRef.current = setTimeout(() => {
      devClickCountRef.current = 0
    }, 600)

    if (devClickCountRef.current >= 3) {
      devClickCountRef.current = 0
      router.push("/admin/developer")
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 relative">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-amber-600" />
          অ্যাডমিন সেটিংস
        </h1>
        <p className="text-gray-600 mt-2">আপনার অ্যাকাউন্ট সেটিংস পরিচালনা করুন</p>
        {/* Developer icon (top-right corner) with triple-click to open */}
        <div className="absolute right-0 top-0">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            title="Developer"
            aria-label="Developer mode"
            onClick={handleDevIconClick}
          >
            <ShieldAlert className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-600" />
              পাসওয়ার্ড পরিবর্তন
            </CardTitle>
            <p className="text-sm text-gray-500">
              {step === "verify"
                ? "ধাপ ১/২: বর্তমান পাসওয়ার্ড নিশ্চিত করুন"
                : "ধাপ ২/২: নতুন ইমেইল/পাসওয়ার্ড দিন"}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === "verify" && (
                <div>
                  <Label htmlFor="email">বর্তমান অ্যাডমিন ইমেইল</Label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={emailLocked ? "admin@fmosweb.com" : "আপনার অ্যাডমিন ইমেইল লিখুন"}
                      value={formData.email}
                      onChange={(e) => {
                        setVerifyError("")
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }}
                      readOnly={emailLocked}
                      autoComplete="email"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {emailLocked
                      ? "এই ইমেইলটি সেশনের ভিত্তিতে নির্ধারিত — ইমেইল বদলাতে চাইলে পরবর্তী ধাপে নতুন ইমেইল দিন।"
                      : "যদি স্বয়ংক্রিয়ভাবে ইমেইল না আসে, এখানে আপনার অ্যাডমিন ইমেইল লিখুন।"}
                  </p>
                </div>
              )}

              {step === "update" && (
                <div>
                  <Label htmlFor="newEmail">নতুন অ্যাডমিন ইমেইল (ঐচ্ছিক)</Label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="newEmail"
                      type="email"
                      placeholder="new-admin@fmosweb.com"
                      value={formData.newEmail}
                      onChange={(e) => setFormData((prev) => ({ ...prev, newEmail: e.target.value }))}
                      autoComplete="email"
                      disabled={isLoading}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">শুধু ইমেইল বদলাতে চাইলে উপরের ভেরিফিকেশন সম্পন্ন করার পর এখানে নতুন ইমেইল দিন।</p>
                </div>
              )}

              {step === "verify" && (
                <div>
                  <Label htmlFor="oldPassword">বর্তমান পাসওয়ার্ড</Label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="oldPassword"
                      type={showPasswords.old ? "text" : "password"}
                      placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                      value={formData.oldPassword}
                      onChange={(e) => {
                        setVerifyError("")
                        setFormData((prev) => ({ ...prev, oldPassword: e.target.value }))
                      }}
                      className="pr-10 pl-9"
                      required
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("old")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {verifyError && (
                    <div role="alert" className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                      {verifyError}
                    </div>
                  )}
                </div>
              )}

              {step === "update" && (
                <div>
                  <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="নতুন পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর)"
                      value={formData.newPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="pr-10 pl-9"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.newPassword && formData.newPassword.length < 6 && (
                    <p className="text-xs text-red-500 mt-1">কমপক্ষে ৬ অক্ষরের হতে হবে</p>
                  )}
                </div>
              )}

              {step === "update" && (
                <div>
                  <Label htmlFor="confirmPassword">নতুন পাসওয়ার্ড নিশ্চিত করুন</Label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="নতুন পাসওয়ার্ড আবার লিখুন"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pr-10 pl-9"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">পাসওয়ার্ড এবং কনফার্ম মিলছে না</p>
                  )}
                </div>
              )}

              {(() => {
                const ne = (formData.newEmail || "").trim()
                const changingEmail = !!ne
                const changingPassword = !!(formData.newPassword || "").trim()
                const label = isLoading
                  ? "পরিবর্তন করা হচ্ছে..."
                  : step === "verify"
                    ? "পরবর্তী ধাপ (ভেরিফাই)"
                    : changingEmail && changingPassword
                      ? "ইমেইল ও পাসওয়ার্ড আপডেট করুন"
                      : changingEmail
                        ? "ইমেইল আপডেট করুন"
                        : "পাসওয়ার্ড পরিবর্তন করুন"
                return (
                  <div className="flex gap-2">
                    {step === "update" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setStep("verify")
                          setVerifiedOld("")
                          setFormData((prev) => ({ ...prev, newEmail: "", newPassword: "", confirmPassword: "" }))
                        }}
                      >
                        পিছনে যান
                      </Button>
                    )}
                    <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading}>
                      {label}
                    </Button>
                  </div>
                )
              })()}

              {step === "update" && updateError && (
                <div role="alert" className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {updateError}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
