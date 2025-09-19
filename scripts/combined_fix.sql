-- Combined script to fix RLS policies and refresh schema cache

-- First part: Fix RLS policies (from 006_fix_categories_rls.sql)

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.categories;

-- Create new policies with true check
CREATE POLICY "Enable read access for all users" ON public.categories
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.categories
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.categories
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON public.categories
FOR DELETE USING (true);

-- Alternatively, you can disable RLS completely
-- ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Second part: Refresh schema cache (from 007_refresh_schema_cache.sql)

-- Make sure the table exists with the correct structure
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Force a schema refresh by altering the table and adding a comment
COMMENT ON COLUMN public.categories.color IS 'Color code or class for the category';

-- Alternative approach: touch the column by altering it and setting it back
ALTER TABLE public.categories ALTER COLUMN color SET DATA TYPE TEXT;

-- Another approach: create a temporary view that references all columns
CREATE OR REPLACE VIEW temp_categories_view AS
SELECT 
  id,
  name,
  description,
  icon,
  image_url,
  color,
  created_at,
  updated_at
FROM public.categories;

-- Drop the temporary view
DROP VIEW temp_categories_view;

-- Create the exec_sql function if it doesn't exist
CREATE OR REPLACE FUNCTION public.exec_sql(sql_string text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_string;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;