import { createAdminClient } from "@/lib/supabase/admin"

export interface OTPRecord {
  id: string
  email: string
  otp: string
  expires_at: string
  used: boolean
  created_at: string
}

// Store OTP in database
export const storeOTP = async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return { success: false, error: "Database connection failed" }
    }

    // Normalize email (lowercase + trim)
    const normalizedEmail = String(email).trim().toLowerCase()

    // Set expiration time to 10 minutes from now
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    const { error } = await supabase
      .from("otp_codes")
      .insert([{
        email: normalizedEmail,
        otp,
        expires_at: expiresAt.toISOString(),
        used: false
      }])

    if (error) {
      console.error("Error storing OTP:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in storeOTP:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

// Verify OTP
export const verifyOTP = async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("[v1] OTP verification started:", { email, otp })
    const supabase = createAdminClient()
    if (!supabase) {
      console.log("[v1] Database connection failed")
      return { success: false, error: "Database connection failed" }
    }

    // Normalize email (lowercase + trim)
    const normalizedEmail = String(email).trim().toLowerCase()

    // Find valid OTP
    console.log("[v1] Searching for OTP in database...")
    const { data, error } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("otp", otp)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    
    console.log("[v1] OTP search result:", { data, error })

    if (error) {
      console.error("Error verifying OTP:", error)
      return { success: false, error: "Invalid or expired OTP" }
    }

    if (!data) {
      return { success: false, error: "Invalid or expired OTP" }
    }

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", data.id)

    if (updateError) {
      console.error("Error marking OTP as used:", updateError)
      // Don't return error here, OTP verification was successful
    }

    return { success: true }
  } catch (error) {
    console.error("Error in verifyOTP:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

// Clean up expired OTPs
export const cleanupExpiredOTPs = async (): Promise<void> => {
  try {
    const supabase = createAdminClient()
    if (!supabase) return

    await supabase
      .from("otp_codes")
      .delete()
      .lt("expires_at", new Date().toISOString())
  } catch (error) {
    console.error("Error cleaning up expired OTPs:", error)
  }
}
