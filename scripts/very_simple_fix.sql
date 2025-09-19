-- Very simple fix for RLS and schema cache issues

-- Disable RLS completely for categories table
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;