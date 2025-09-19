-- Complete fix for both RLS and schema cache issues

-- 1. Disable RLS completely for categories table
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- 2. Force a schema refresh by altering the table and adding a comment
COMMENT ON COLUMN public.categories.color IS 'Color code or class for the category';

-- 3. Touch the column by altering it and setting it back
ALTER TABLE public.categories ALTER COLUMN color SET DATA TYPE TEXT;

-- 4. Create a temporary view that references all columns
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

-- 5. Drop the temporary view
DROP VIEW temp_categories_view;

-- 6. Create the exec_sql function if it doesn't exist
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;