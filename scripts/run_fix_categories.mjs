import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'

// Read environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runSqlFix() {
  try {
    // Get current file path in ESM
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '006_fix_categories_rls.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    
    // Execute the SQL directly using raw query
    const { error } = await supabase.from('').select('*').limit(1).then(async () => {
      // This is a workaround to execute raw SQL
      // We're using the PostgreSQL function to execute our SQL
      return await supabase.rpc('exec_sql', { sql: sqlContent })
    })
    
    if (error) {
      console.error('Error executing SQL:', error)
      console.error('This may be because the exec_sql function is not available.')
      console.error('You may need to run this SQL manually in the Supabase dashboard SQL editor.')
      console.error('SQL to run:', sqlContent)
      process.exit(1)
    }
    
    console.log('Successfully fixed categories RLS policies!')
  } catch (err) {
    console.error('Error running SQL fix:', err)
    process.exit(1)
  }
}

runSqlFix()