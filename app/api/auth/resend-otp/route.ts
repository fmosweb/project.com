import { NextRequest, NextResponse } from "next/server"
import { generateOTP } from "@/lib/services/email"
import { storeOTP } from "@/lib/services/otp"
import { sendOTPEmail } from "@/lib/services/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Email is required" 
        },
        { status: 400 }
      )
    }

    // Normalize email and generate OTP
    const normalizedEmail = String(email).trim().toLowerCase()
    const otp = generateOTP()

    // Store OTP in database
    const { success: storeSuccess, error: storeError } = await storeOTP(normalizedEmail, otp)

    if (!storeSuccess) {
      return NextResponse.json(
        { 
          success: false, 
          message: storeError || "Failed to store OTP" 
        },
        { status: 500 }
      )
    }

    // Send OTP email
    const { success: emailSuccess, error: emailError } = await sendOTPEmail(normalizedEmail, otp)

    if (!emailSuccess) {
      return NextResponse.json(
        { 
          success: false, 
          message: emailError || "Failed to send OTP email" 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      email: normalizedEmail
    })

  } catch (error) {
    console.error("Error resending OTP:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    )
  }
}