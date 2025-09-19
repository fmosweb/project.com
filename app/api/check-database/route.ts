import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: "Database connection failed"
      }, { status: 500 })
    }

    console.log("🔍 [DATABASE CHECK] Checking database tables...")
    
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'otp_codes', 'profiles'])

    if (tablesError) {
      console.error("🔍 [DATABASE CHECK] Error checking tables:", tablesError)
      return NextResponse.json({
        success: false,
        error: `Error checking tables: ${tablesError.message}`
      }, { status: 500 })
    }

    const existingTables = tables?.map(t => t.table_name) || []
    console.log("🔍 [DATABASE CHECK] Existing tables:", existingTables)

    // Check users table
    let usersData = null
    let usersError = null
    if (existingTables.includes('users')) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .limit(5)
      
      usersData = data
      usersError = error
    }

    // Check otp_codes table
    let otpData = null
    let otpError = null
    if (existingTables.includes('otp_codes')) {
      const { data, error } = await supabase
        .from("otp_codes")
        .select("*")
        .limit(5)
      
      otpData = data
      otpError = error
    }

    // Check profiles table
    let profilesData = null
    let profilesError = null
    if (existingTables.includes('profiles')) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(5)
      
      profilesData = data
      profilesError = error
    }

    return NextResponse.json({
      success: true,
      data: {
        tables: {
          existing: existingTables,
          missing: ['users', 'otp_codes', 'profiles'].filter(t => !existingTables.includes(t))
        },
        users: {
          exists: existingTables.includes('users'),
          data: usersData,
          error: usersError?.message,
          count: usersData?.length || 0
        },
        otp_codes: {
          exists: existingTables.includes('otp_codes'),
          data: otpData,
          error: otpError?.message,
          count: otpData?.length || 0
        },
        profiles: {
          exists: existingTables.includes('profiles'),
          data: profilesData,
          error: profilesError?.message,
          count: profilesData?.length || 0
        }
      },
      message: `Found ${existingTables.length} tables: ${existingTables.join(', ')}`
    })

  } catch (error) {
    console.error("🔍 [DATABASE CHECK] Database check error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
