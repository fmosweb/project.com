import { NextResponse, NextRequest } from "next/server"
import { getUsers, getUserDetails } from "@/lib/services/admin"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("id")

  try {
    if (userId) {
      // Get specific user details
      const { data: user, error: userError } = await getUserDetails(userId)
      
      if (userError || !user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
            message: userError || "User not found"
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: user,
        source: "supabase"
      })
    } else {
      // Get all users
      console.log("🔄 [ADMIN API] Fetching all users...")
      const { data: users, error: usersError } = await getUsers()
      
      console.log("🔄 [ADMIN API] Users result:", { 
        usersCount: users?.length || 0, 
        error: usersError,
        users: users 
      })
      
      if (usersError) {
        console.error("❌ [ADMIN API] Error fetching users:", usersError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch users",
            message: usersError
          },
          { status: 500 }
        )
      }
      
      console.log("✅ [ADMIN API] Returning users:", users?.length || 0, "users")
      console.log("📋 [ADMIN API] Users data:", users)
      
      return NextResponse.json({
        success: true,
        data: users,
        source: "supabase",
        count: users?.length || 0
      })
    }
  } catch (error) {
    console.error("[v1] Error fetching users:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
    }

    const body = await request.json()
    const { userId, status } = body as { userId?: string; status?: string }

    if (!userId || !status) {
      return NextResponse.json({ success: false, error: "User ID and status are required" }, { status: 400 })
    }

    const normalizedStatus = String(status).toLowerCase()
    if (!['active', 'blocked', 'pending'].includes(normalizedStatus)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 })
    }

    // Update users table: we don't have a dedicated 'status' column; use verified as proxy
    const verified = normalizedStatus !== 'blocked'

    const { data, error } = await supabase
      .from("users")
      .update({ verified, updated_at: new Date().toISOString(), status: normalizedStatus })
      .eq("id", userId)
      .select("id, email, name, mobile, verified")
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }
      // If status column doesn't exist, try updating without it
      if ((error.message || '').toLowerCase().includes('column') && (error.message || '').toLowerCase().includes('status')) {
        const { data: data2, error: error2 } = await supabase
          .from("users")
          .update({ verified, updated_at: new Date().toISOString() })
          .eq("id", userId)
          .select("id, email, name, mobile, verified")
          .single()
        if (error2) {
          return NextResponse.json({ success: false, error: error2.message }, { status: 500 })
        }
        // Best-effort: update profiles.status if available
        await supabase.from('profiles').update({ status: normalizedStatus }).eq('id', userId)
        return NextResponse.json({ success: true, data: data2 })
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Best-effort: also reflect status on profiles if schema supports it
    await supabase.from('profiles').update({ status: normalizedStatus }).eq('id', userId)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update user status" }, { status: 500 })
  }
}