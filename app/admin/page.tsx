"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Import the new DashboardContent component dynamically with SSR disabled
const AdminDashboardContent = dynamic(
  () => import("@/components/admin/NewDashboardContent"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading dashboard...</span>
      </div>
    )
  }
)

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false)
  
  // This effect runs once on mount to indicate we're on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div suppressHydrationWarning>
      {isClient ? <AdminDashboardContent /> : (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading dashboard...</span>
        </div>
      )}
    </div>
  )
}
