import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from "next/cache"
import { getDashboardStats } from "@/lib/services/admin"
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Ensure no caching at any layer
    noStore()
    console.log("🔄 [DASHBOARD API] Starting dashboard stats fetch...")
    
    const { data, error } = await getDashboardStats()
    
    console.log("🔄 [DASHBOARD API] Dashboard stats result:", { data, error })
    
    if (error) {
      console.error("❌ [DASHBOARD API] Error fetching dashboard stats:", error)
      
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch dashboard statistics",
          message: error
        },
        { status: 500 }
      )
    }
    
    console.log("✅ [DASHBOARD API] Successfully fetched dashboard stats:", data)
    
    return NextResponse.json({
      success: true,
      data,
      source: "supabase"
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error("❌ [DASHBOARD API] Error fetching dashboard stats:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard statistics",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}