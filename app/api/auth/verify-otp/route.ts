import { NextRequest, NextResponse } from "next/server"
import { verifyOTP } from "@/lib/services/otp"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()
    
    console.log("[v1] OTP verification request:", { email, otp })

    if (!email || !otp) {
      console.log("[v1] Missing email or OTP")
      return NextResponse.json(
        { 
          success: false, 
          message: "Email and OTP are required" 
        },
        { status: 400 }
      )
    }

    // Verify OTP
    console.log("[v1] Verifying OTP...")
    const normalizedEmail = String(email).trim().toLowerCase()
    const { success, error } = await verifyOTP(normalizedEmail, otp)
    console.log("[v1] OTP verification result:", { success, error })

    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          message: error || "Invalid or expired OTP" 
        },
        { status: 400 }
      )
    }

    // OTP verified successfully, now verify the user account
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Database connection failed" 
        },
        { status: 500 }
      )
    }

    // Update user verification status
    const { error: updateError } = await supabase
      .from("users")
      .update({ verified: true })
      .eq("email", normalizedEmail)

    if (updateError) {
      console.error("Error updating user verification:", updateError)
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to verify account" 
        },
        { status: 500 }
      )
    }

    // Fetch verified user details
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .single()

    if (userError) {
      console.error("Error fetching user after verification:", userError)
      return NextResponse.json(
        { 
          success: true,
          message: "Account verified successfully",
          user: null
        }
      )
    }

    // Ensure a matching profile exists for admin detail views
    if (userData) {
      const profilePayload = {
        id: userData.id,
        full_name: userData.name || "",
        phone: userData.mobile || "",
        email: userData.email || normalizedEmail,
        // address optional in schema; omit if not present
      }
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([profilePayload], { onConflict: "id" })

      if (profileError) {
        console.error("[v1] Warning: could not upsert profile:", profileError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Account verified successfully",
      user: userData
    })

  } catch (error) {
    console.error("Error verifying OTP:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    )
  }
}