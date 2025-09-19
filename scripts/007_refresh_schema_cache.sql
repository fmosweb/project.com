-- Script to refresh the schema cache for the categories table

-- First, let's make sure the table exists with the correct structure
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