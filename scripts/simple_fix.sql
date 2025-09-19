-- Simple fix for RLS and schema cache issues

-- Disable RLS completely for categories table
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Force a schema refresh by adding a comment
COMMENT ON COLUMN public.categories.color IS 'Color code or class for the category';

-- Touch the column by altering it and setting it back
ALTER TABLE public.categories ALTER COLUMN color SET DATA TYPE TEXT;