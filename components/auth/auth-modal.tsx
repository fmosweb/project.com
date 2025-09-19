"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"
import OTPVerification from "./otp-verification"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess?: (user: any) => void
}

type AuthStep = "login" | "register" | "otp"

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>("login")
  const [pendingMobile, setPendingMobile] = useState("")
  const [pendingEmail, setPendingEmail] = useState("")

  const handleLoginSuccess = (user: any) => {
    onAuthSuccess?.(user)
    onClose()
  }

  const handleRegistrationSuccess = (mobile: string, email?: string) => {
    console.log("[v1] Registration success in AuthModal:", mobile, email)
    setPendingMobile(mobile)
    setPendingEmail(email || "")
    setCurrentStep("otp")
  }

  const handleOTPSuccess = () => {
    // After OTP verification, automatically log the user in
    onAuthSuccess?.({ mobile: pendingMobile })
    onClose()
  }

  const handleBack = () => {
    setCurrentStep("register")
    setPendingMobile("")
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "login":
        return <LoginForm onSwitchToRegister={() => setCurrentStep("register")} onLoginSuccess={handleLoginSuccess} />
      case "register":
        return (
          <RegisterForm
            onSwitchToLogin={() => setCurrentStep("login")}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        )
      case "otp":
        return <OTPVerification mobile={pendingMobile} email={pendingEmail} onVerificationSuccess={handleOTPSuccess} onBack={handleBack} />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">{renderCurrentStep()}</DialogContent>
    </Dialog>
  )
}
