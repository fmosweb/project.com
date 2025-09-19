"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Eye, EyeOff } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { login, signup, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{11}$/
    return phoneRegex.test(phone)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    // Validation
    if (!loginData.email) {
      newErrors.email = "ইমেইল প্রয়োজন"
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = "সঠিক ইমেইল ফরম্যাট দিন"
    }

    if (!loginData.password) {
      newErrors.password = "পাসওয়ার্ড প্রয়োজন"
    } else if (loginData.password.length < 6) {
      newErrors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        const success = await login(loginData.email, loginData.password)
        if (success) {
          onClose()
          onSuccess?.()
        } else {
          // এখানে ইমেইল ফিল্ডে এরর মেসেজ সেট করা হচ্ছে যদি login ফাংশন false রিটার্ন করে
          newErrors.email = "ভুল ইমেইল বা পাসওয়ার্ড"
          setErrors(newErrors)
        }
      } catch (error) {
        // যদি কোন এরর থাকে তবে সেটি ক্যাচ করা হচ্ছে
        newErrors.email = "লগইন করতে সমস্যা হয়েছে, আবার চেষ্টা করুন"
        setErrors(newErrors)
      }
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    // Validation
    if (!signupData.name) {
      newErrors.name = "নাম প্রয়োজন"
    } else if (signupData.name.length < 2) {
      newErrors.name = "নাম কমপক্ষে ২ অক্ষরের হতে হবে"
    }

    if (!signupData.email) {
      newErrors.email = "ইমেইল প্রয়োজন"
    } else if (!validateEmail(signupData.email)) {
      newErrors.email = "সঠিক ইমেইল ফরম্যাট দিন"
    }

    if (signupData.phone && !validatePhone(signupData.phone)) {
      newErrors.phone = "সঠিক মোবাইল নম্বর দিন (১১ সংখ্যা)"
    }

    if (!signupData.password) {
      newErrors.password = "পাসওয়ার্ড প্রয়োজন"
    } else if (signupData.password.length < 6) {
      newErrors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"
    }

    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "পাসওয়ার্ড মিলছে না"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        const success = await signup(signupData.name, signupData.email, signupData.password, signupData.phone)
        if (success) {
          onClose()
          onSuccess?.()
        } else {
          // এখানে ইমেইল ফিল্ডে এরর মেসেজ সেট করা হচ্ছে যদি signup ফাংশন false রিটার্ন করে
          // সম্ভবত ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে
          newErrors.email = "এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট আছে"
          setErrors(newErrors)
        }
      } catch (error) {
        // যদি কোন এরর থাকে তবে সেটি ক্যাচ করা হচ্ছে
        newErrors.email = "একাউন্ট তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করুন"
        setErrors(newErrors)
      }
    }
  }

  const resetForms = () => {
    setLoginData({ email: "", password: "" })
    setSignupData({ name: "", email: "", phone: "", password: "", confirmPassword: "" })
    setErrors({})
    setShowPassword(false)
  }

  const handleClose = () => {
    resetForms()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {activeTab === "login" ? "লগইন করুন" : "নতুন একাউন্ট তৈরি করুন"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">লগইন</TabsTrigger>
            <TabsTrigger value="signup">সাইনআপ</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">ইমেইল</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="আপনার ইমেইল দিন"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">পাসওয়ার্ড</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="আপনার পাসওয়ার্ড দিন"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    লগইন হচ্ছে...
                  </>
                ) : (
                  "লগইন করুন"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">পূর্ণ নাম</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="আপনার পূর্ণ নাম দিন"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">ইমেইল</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="আপনার ইমেইল দিন"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone">মোবাইল নম্বর (ঐচ্ছিক)</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">পাসওয়ার্ড</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="পাসওয়ার্ড আবার দিন"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    একাউন্ট তৈরি হচ্ছে...
                  </>
                ) : (
                  "একাউন্ট তৈরি করুন"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default AuthModal
