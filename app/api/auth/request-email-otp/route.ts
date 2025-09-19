import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateOTP, sendOTPEmail } from "@/lib/services/email"
import { storeOTP } from "@/lib/services/otp"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address" },
        { status: 400 }
      )
    }

    // reCAPTCHA is not enforced for email OTP login requests

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: "Database connection failed" },
        { status: 500 }
      )
    }

    // Normalize email (case-insensitive uniqueness)
    const normalizedEmail = String(email).trim().toLowerCase()

    // Ensure a user exists for this email (create minimal record if missing)
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle()

    if (findError) {
      console.error("[EMAIL OTP] Error checking user:", findError)
    }

    if (!existingUser) {
      const defaultName = (normalizedEmail.split("@")[0] || "User").slice(0, 50)
      // Use upsert with onConflict to avoid duplicates due to race conditions
      const { error: createError } = await supabase
        .from("users")
        .upsert(
          [{
            name: defaultName,
            email: normalizedEmail,
            verified: false,
          }],
          { onConflict: "email", ignoreDuplicates: true }
        )

      if (createError) {
        console.error("[EMAIL OTP] Error creating minimal user:", createError)
        // Not fatal for sending OTP, but helps admin visibility
      }
    }

    // Generate and store OTP
    const otp = generateOTP()
    const { success: storeSuccess, error: storeError } = await storeOTP(normalizedEmail, otp)
    if (!storeSuccess) {
      return NextResponse.json(
        { success: false, message: storeError || "Failed to store OTP" },
        { status: 500 }
      )
    }

    // Send OTP email
    const { success: emailSuccess, error: emailError } = await sendOTPEmail(normalizedEmail, otp)
    if (!emailSuccess) {
      return NextResponse.json(
        { success: false, message: emailError || "Failed to send OTP email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
      email: normalizedEmail
    })
  } catch (error) {
    console.error("[EMAIL OTP] Unexpected error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
