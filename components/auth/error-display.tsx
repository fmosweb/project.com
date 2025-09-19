"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react"

interface ErrorDisplayProps {
  type: "error" | "success" | "warning" | "info"
  message: string
  className?: string
}

export default function ErrorDisplay({ type, message, className = "" }: ErrorDisplayProps) {
  const getAlertConfig = () => {
    switch (type) {
      case "error":
        return {
          variant: "destructive" as const,
          icon: <XCircle className="h-4 w-4" />,
          className: "border-red-200 bg-red-50 text-red-800"
        }
      case "success":
        return {
          variant: "default" as const,
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          className: "border-green-200 bg-green-50 text-green-800"
        }
      case "warning":
        return {
          variant: "default" as const,
          icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
          className: "border-amber-200 bg-amber-50 text-amber-800"
        }
      case "info":
        return {
          variant: "default" as const,
          icon: <Info className="h-4 w-4 text-blue-600" />,
          className: "border-blue-200 bg-blue-50 text-blue-800"
        }
      default:
        return {
          variant: "default" as const,
          icon: <AlertCircle className="h-4 w-4" />,
          className: ""
        }
    }
  }

  const config = getAlertConfig()

  return (
    <Alert className={`${config.className} ${className}`}>
      {config.icon}
      <AlertDescription className="font-medium">
        {message}
      </AlertDescription>
    </Alert>
  )
}
