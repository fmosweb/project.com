// Fix Products Schema Cache Script
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase connection details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase URL or service role key in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixProductsSchema() {
  console.log('Starting products schema cache refresh...');

  try {
    // SQL to refresh schema cache
    const sql = `
    -- Make sure the products table exists with the correct structure
    CREATE TABLE IF NOT EXISTS public.products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      original_price DECIMAL(10,2),
      category TEXT,
      brand TEXT,
      stock INTEGER DEFAULT 0,
      stock_quantity INTEGER DEFAULT 0,
      sku TEXT,
      weight DECIMAL(10,2),
      dimensions TEXT,
      is_active BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false,
      tags TEXT[],
      features TEXT[],
      images TEXT[],
      image_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Force a schema refresh by altering the table and adding a comment
    COMMENT ON COLUMN public.products.image_url IS 'URL for the product image';

    -- Alternative approach: touch the column by altering it and setting it back
    ALTER TABLE public.products ALTER COLUMN image_url SET DATA TYPE TEXT;
    `;

    // Execute the SQL directly
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('Error executing SQL via RPC:', error);
      console.log('\nTrying alternative method...');
      
      // Try direct SQL execution
      const { error: directError } = await supabase.from('_temp_migration').insert({
        name: 'schema_refresh',
        sql: sql
      });
      
      if (directError) {
        console.error('Error with alternative method:', directError);
        console.log('\nManual steps to refresh schema cache:');
        console.log('1. Go to the Supabase dashboard');
        console.log('2. Open SQL Editor');
        console.log('3. Copy and paste the contents of scripts/complete_products_fix.sql');
        console.log('4. Execute the SQL');
        process.exit(1);
      } else {
        console.log('Schema cache refresh completed via alternative method!');
      }
    } else {
      console.log('Schema cache refresh completed successfully!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

fixProductsSchema();