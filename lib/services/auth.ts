import { createClient } from "@/lib/supabase/server"

export interface User {
  id: string
  name: string
  mobile: string
  verified: boolean
  created_at: string
  verified_at?: string
}

export interface OTPRecord {
  mobile: string
  otp: string
  expires_at: string
  verified: boolean
  created_at: string
}

// Server-side auth operations
export async function createUser(name: string, email: string, mobile: string, password: string) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return { data: null, error: "Database connection not available" }
    }

    // Normalize inputs
    const normalizedEmail = String(email).trim().toLowerCase()
    const normalizedMobile = String(mobile).trim()

    // Check if user already exists by normalized email or exact mobile
    const { data: emailRows, error: emailCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .limit(1)
    const { data: mobileRows, error: mobileCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("mobile", normalizedMobile)
      .limit(1)

    if (!emailCheckError && Array.isArray(emailRows) && emailRows.length > 0) {
      return { data: null, error: "Email already registered" }
    }
    
    if (!mobileCheckError && Array.isArray(mobileRows) && mobileRows.length > 0) {
      return { data: null, error: "Mobile number already registered" }
    }

    // Create user in users table (unverified initially) - concurrency-safe via upsert(email)
    console.log("[v1] Upserting user:", { name, email: normalizedEmail, mobile: normalizedMobile, password: password ? "***" : "MISSING", verified: false })

    let userData: any = null
    let userError: any = null
    try {
      const payloadWithPassword: any = {
        name,
        email: normalizedEmail,
        mobile: normalizedMobile,
        password, // In production, hash this
        verified: false,
      }
      const upsertResult = await supabase
        .from("users")
        .upsert([payloadWithPassword], { onConflict: "email", ignoreDuplicates: true })
        .select()
        .maybeSingle()
      userData = upsertResult.data
      userError = upsertResult.error
    } catch (e: any) {
      userError = e
    }

    // If password column doesn't exist, retry upsert without it
    if (userError && String(userError?.message || "").toLowerCase().includes("column \"password\"")) {
      console.log("[v1] Password column missing in users table, retrying upsert without password...")
      const { data: retryData, error: retryError } = await supabase
        .from("users")
        .upsert([
          {
            name,
            email: normalizedEmail,
            mobile: normalizedMobile,
            verified: false,
          },
        ], { onConflict: "email", ignoreDuplicates: true })
        .select()
        .maybeSingle()
      userData = retryData
      userError = retryError
    }

    // If upsert ignored due to duplicate (no data returned), fetch existing row
    if (!userError && !userData) {
      const { data: existingRow, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", normalizedEmail)
        .single()
      userData = existingRow
      userError = fetchError
    }

    if (userError) {
      const msg = String(userError?.message || "")
      // If unique/duplicate error from DB, treat as already-registered
      if (/duplicate key value|unique constraint|users_email/i.test(msg)) {
        // Ensure we don't create a second account; return friendly message
        return { data: null, error: "Email already registered" }
      }
      console.error("User creation error:", userError)
      return { data: null, error: userError.message }
    }

    // Also create profile for admin visibility using admin client
    try {
      const { createAdminClient } = require("@/lib/supabase/admin")
      const adminSupabase = createAdminClient()
      
      if (adminSupabase) {
        const { data: profileData, error: profileError } = await adminSupabase
          .from("profiles")
          .upsert({
            id: userData.id,
            full_name: name,
            phone: normalizedMobile,
            email: normalizedEmail,
            address: null
          }, { onConflict: "id" })
          .select()
          .single()

        if (profileError) {
          console.log("Profile creation warning:", profileError.message)
        } else {
          console.log("Profile created successfully for admin visibility")
        }
      }
    } catch (profileError) {
      console.log("Profile creation failed:", profileError)
    }

    return { data: userData, error: null }
  } catch (error) {
    console.error("Create user error:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export async function storeOTP(mobile: string, otp: string) {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Database connection not available")
  }

  // Delete any existing OTP for this mobile
  await supabase.from("otp_codes").delete().eq("mobile", mobile)

  // Store new OTP
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes

  const { data, error } = await supabase
    .from("otp_codes")
    .insert({
      mobile,
      otp,
      expires_at: expiresAt,
      verified: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function verifyOTP(mobile: string, otp: string) {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Database connection not available")
  }

  // Get OTP record
  const { data: otpRecord, error: otpError } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("mobile", mobile)
    .eq("verified", false)
    .single()

  if (otpError || !otpRecord) {
    throw new Error("No OTP found for this mobile number")
  }

  // Check if expired
  if (new Date() > new Date(otpRecord.expires_at)) {
    // Clean up expired OTP
    await supabase.from("otp_codes").delete().eq("mobile", mobile)

    throw new Error("OTP has expired. Please request a new one.")
  }

  // Verify OTP
  if (otpRecord.otp !== otp) {
    throw new Error("Invalid OTP")
  }

  // Mark user as verified
  const { data: user, error: userError } = await supabase
    .from("users")
    .update({
      verified: true,
      verified_at: new Date().toISOString(),
    })
    .eq("mobile", mobile)
    .select()
    .single()

  if (userError) throw userError

  // Mark OTP as used and delete
  await supabase.from("otp_codes").delete().eq("mobile", mobile)

  return user
}

export async function loginUser(mobile: string, password: string) {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Database connection not available")
  }

  // First check if user exists
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("mobile", mobile)
    .single()

  if (error || !user) {
    throw new Error("মোবাইল নম্বর বা পাসওয়ার্ড ভুল")
  }

  // Check if user is verified
  if (!user.verified) {
    throw new Error("আপনার অ্যাকাউন্ট ভেরিফাই করা হয়নি। অনুগ্রহ করে ইমেইল ভেরিফিকেশন সম্পূর্ণ করুন।")
  }

  // Verify password (in production, compare hashed passwords)
  if (user.password !== password) {
    throw new Error("মোবাইল নম্বর বা পাসওয়ার্ড ভুল")
  }

  return {
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    verified: user.verified,
  }
}

// SMS sending function - replace with real SMS provider
export async function sendSMS(mobile: string, message: string) {
  console.log(`[v0] SMS to ${mobile}: ${message}`)

  // For Bangladesh, you can integrate with:
  // - SSL Wireless: https://sslwireless.com/
  // - Grameenphone SMS API
  // - Robi SMS API
  // - MSG91: https://msg91.com/
  // - Twilio: https://www.twilio.com/docs/sms

  // Example integration with SSL Wireless (Bangladesh):
  /*
  const response = await fetch('https://smsplus.sslwireless.com/api/v3/send-sms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SSL_SMS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_token: process.env.SSL_SMS_API_TOKEN,
      sid: process.env.SSL_SMS_SID,
      msisdn: mobile,
      sms: message,
      csms_id: Date.now().toString()
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to send SMS')
  }
  */

  return true
}

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}
