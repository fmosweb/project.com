import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function refreshSchemaCache() {
  console.log('Starting schema cache refresh...')

  // Create Supabase client with service role key to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing Supabase environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '007_refresh_schema_cache.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')

    console.log('Executing SQL to refresh schema cache...')

    // Execute the SQL directly
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    })

    if (error) {
      console.error('Error executing SQL via RPC:', error)
      
      // Since direct SQL execution is not available, provide manual instructions
      console.log('\nManual steps to refresh schema cache:')
      console.log('1. Go to the Supabase dashboard')
      console.log('2. Open SQL Editor')
      console.log(`3. Copy and paste the contents of scripts/007_refresh_schema_cache.sql`)
      console.log('4. Execute the SQL')
      process.exit(1)
    }
    
    console.log('Schema cache refresh completed successfully!')
    console.log('The "color" column should now be recognized in the categories table.')
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

refreshSchemaCache()