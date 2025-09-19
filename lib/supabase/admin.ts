import { createClient as createServiceClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase admin client with service role permissions
 * This client bypasses RLS policies and should only be used in admin contexts
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Environment variables missing for Supabase admin client. Returning null client.")
    return null
  }

  try {
    return createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`
        },
      },
    })
  } catch (error) {
    console.error("Error creating Supabase admin client:", error)
    return null
  }
}