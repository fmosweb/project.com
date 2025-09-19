"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Shield } from "lucide-react"

export default function TestRegistrationPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  })
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    addLog(`Validating form data: ${JSON.stringify(formData)}`)
    
    // Name validation
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "নাম প্রয়োজন"
    } else if (formData.name.length < 2) {
      errors.name = "নাম কমপক্ষে ২ অক্ষর হতে হবে"
    }
    
    // Email validation
    if (!formData.email || formData.email.trim() === "") {
      errors.email = "ইমেইল প্রয়োজন"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "সঠিক ইমেইল ঠিকানা দিন"
    }
    
    // Mobile validation
    if (!formData.mobile || formData.mobile.trim() === "") {
      errors.mobile = "মোবাইল নম্বর প্রয়োজন"
    } else if (!/^01[3-9]\d{8}$/.test(formData.mobile)) {
      errors.mobile = "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)"
    }
    
    // Password validation
    if (!formData.password || formData.password.trim() === "") {
      errors.password = "পাসওয়ার্ড প্রয়োজন"
    } else if (formData.password.length < 6) {
      errors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে"
    }
    
    addLog(`Validation errors: ${JSON.stringify(errors)}`)
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    addLog("Form submitted!")
    addLog(`Current formData: ${JSON.stringify(formData)}`)
    
    setLoading(true)
    setError("")
    setSuccess("")

    // Validate form
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      addLog(`Form validation failed: ${JSON.stringify(validationErrors)}`)
      setError("Form validation failed. Check logs.")
      setLoading(false)
      return
    }
    
    addLog("Form validation passed")

    try {
      addLog(`Sending registration request to /api/auth/register`)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      addLog(`Registration response: ${JSON.stringify({ status: response.status, data })}`)

      if (response.ok) {
        setSuccess("আপনার ইমেইলে OTP কোড পাঠানো হয়েছে। অনুগ্রহ করে ভেরিফাই করুন।")
        setShowOtpInput(true)
        addLog("Registration successful! OTP input should now be visible.")
      } else {
        setError(data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে")
        addLog(`Registration failed: ${data.message}`)
      }
    } catch (err) {
      setError("নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।")
      addLog(`Registration error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpLoading(true)
    setError("")
    setSuccess("")

    if (!otp || otp.length !== 6) {
      setError("সঠিক ৬ সংখ্যার OTP কোড দিন")
      setOtpLoading(false)
      return
    }

    addLog(`Verifying OTP: ${otp} for email: ${formData.email}`)

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        }),
      })

      const data = await response.json()
      addLog(`OTP verification response: ${JSON.stringify({ status: response.status, data })}`)

      if (response.ok) {
        setSuccess("আপনার একাউন্ট সফলভাবে যাচাইকৃত হয়েছে!")
        addLog("OTP verification successful!")
      } else {
        setError(data.message || "OTP যাচাইকরণ ব্যর্থ হয়েছে")
        addLog(`OTP verification failed: ${data.message}`)
      }
    } catch (err) {
      setError("নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।")
      addLog(`OTP verification error: ${err}`)
    } finally {
      setOtpLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Test Registration</CardTitle>
            <CardDescription>Test OTP registration flow</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {!showOtpInput ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "একাউন্ট তৈরি করুন"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP Verification Code</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    OTP কোডটি {formData.email} এ পাঠানো হয়েছে
                  </p>
                </div>

                <Button 
                  type="button" 
                  onClick={handleOtpSubmit} 
                  className="w-full" 
                  disabled={otpLoading || otp.length !== 6}
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
            <CardDescription>Real-time registration flow logs</CardDescription>
            <Button onClick={clearLogs} size="sm" variant="outline">
              Clear Logs
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Start testing to see logs here.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
