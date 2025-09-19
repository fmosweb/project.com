# Products Schema Fix Instructions

## Error: "image_url" column not found in "public.products" relation

This document provides clear instructions on how to fix the schema cache issue with the products table.

## Solution

### Option 1: Run the SQL commands directly

1. Open your Supabase dashboard and navigate to the SQL Editor
2. Copy and paste the following SQL commands:

```sql
-- Script to refresh the schema cache for the products table

-- First, let's make sure the table exists with the correct structure
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
  image_url TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.products;

-- Create RLS policies with true checks to force schema refresh
CREATE POLICY "Enable read access for all users" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.products
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON public.products
  FOR DELETE USING (true);

-- Force schema cache refresh using multiple methods

-- Method 1: Add a comment to the table
COMMENT ON TABLE public.products IS 'Products table with refreshed schema cache';

-- Method 2: Alter a column type and then change it back
ALTER TABLE public.products ALTER COLUMN price TYPE DECIMAL(10,2);

-- Method 3: Create and drop a temporary view
CREATE OR REPLACE VIEW _temp_migration AS SELECT * FROM public.products;
DROP VIEW _temp_migration;

-- Verify the image_url column exists
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'image_url';
```

3. Click "Run" to execute the SQL commands
4. Restart your Next.js development server

### Option 2: Use the provided script

1. Run the following command in your terminal:
   ```
   npm run show-products-fix
   ```

2. Copy the SQL output and paste it into the Supabase SQL Editor
3. Execute the SQL commands
4. Restart your Next.js development server

## Common Mistakes to Avoid

❌ **DO NOT** paste the JavaScript file directly into the SQL Editor

Incorrect (causes syntax error):
```
// Simple script to display the SQL commands needed to fix the products schema cache issue
...
```

✅ **DO** paste only the SQL commands from the output

Correct (starts with SQL comments):
```sql
-- Script to refresh the schema cache for the products table
...
```

## Verification

After applying the fix and restarting your server, you should be able to add products with images without encountering the "image_url column not found" error.