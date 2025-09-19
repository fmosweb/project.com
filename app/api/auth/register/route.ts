import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/services/auth"
import { generateOTP, sendOTPEmail } from "@/lib/services/email"
import { storeOTP } from "@/lib/services/otp"

export async function POST(request: NextRequest) {
  try {
    const { name, email, mobile, password } = await request.json()
    
    console.log("[v1] Registration request:", { name, email, mobile })

    // Validate input
    if (!name || !email || !mobile || !password) {
      console.log("[v1] Missing required fields:", { name: !!name, email: !!email, mobile: !!mobile, password: !!password })
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 },
      )
    }

    const mobileRegex = /^01[3-9]\d{8}$/
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { message: "Please enter a valid Bangladesh mobile number (01XXXXXXXXX)" },
        { status: 400 },
      )
    }

    // Create user in database (unverified initially)
    console.log("[v1] Creating user...")
    const userResult = await createUser(name, email, mobile, password)
    
    if (userResult.error) {
      console.log("[v1] User creation failed:", userResult.error)
      return NextResponse.json({ message: userResult.error }, { status: 400 })
    }
    
    console.log("[v1] User created successfully:", userResult.data?.id)

    // Generate and store OTP
    const otp = generateOTP()
    console.log("[v1] Generated OTP:", otp)
    
    const { success: storeSuccess, error: storeError } = await storeOTP(email, otp)

    if (!storeSuccess) {
      console.log("[v1] OTP storage failed:", storeError)
      return NextResponse.json({ 
        message: storeError || "Failed to store OTP" 
      }, { status: 500 })
    }
    
    console.log("[v1] OTP stored successfully")

    // Send OTP email
    console.log("[v1] Sending OTP email...")
    const { success: emailSuccess, error: emailError } = await sendOTPEmail(email, otp)

    if (!emailSuccess) {
      console.log("[v1] Email sending failed:", emailError)
      return NextResponse.json({ 
        message: emailError || "Failed to send OTP email" 
      }, { status: 500 })
    }
    
    console.log("[v1] OTP email sent successfully")

    return NextResponse.json({
      message: "Registration successful. OTP sent to your email.",
      email,
      user: userResult.data,
      requiresOtp: true,
      otp: otp // Return OTP for testing
    })
  } catch (error: any) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json(
      {
        message: error.message || "Internal server error",
      },
      { status: 500 },
    )
  }
}
