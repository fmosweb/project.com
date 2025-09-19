import { createBrowserClient } from "@supabase/ssr"

// Use environment variables instead of hardcoded values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey 
  ? createBrowserClient(supabaseUrl, supabaseKey)
  : null