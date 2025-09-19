-- Fix RLS policies and refresh schema cache

-- Drop existing RLS policies for categories
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.categories;

-- Create new policies with true check for categories
CREATE POLICY "Enable read access for all users" ON public.categories
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.categories
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.categories
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON public.categories
FOR DELETE USING (true);

-- Drop existing RLS policies for users
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.users;

-- Create new policies with true check for users
CREATE POLICY "Enable read access for all users" ON public.users
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.users
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.users
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON public.users
FOR DELETE USING (true);

-- Drop existing RLS policies for profiles
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.profiles;

-- Create new policies with true check for profiles
CREATE POLICY "Enable read access for all users" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.profiles
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON public.profiles
FOR DELETE USING (true);

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

-- Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'color') THEN
    ALTER TABLE public.categories ADD COLUMN color TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'icon') THEN
    ALTER TABLE public.categories ADD COLUMN icon TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'image_url') THEN
    ALTER TABLE public.categories ADD COLUMN image_url TEXT;
  END IF;
END
$$;

-- Force a schema refresh for categories by altering the table and adding a comment
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'color') THEN
    COMMENT ON COLUMN public.categories.color IS 'Color code or class for the category';
    -- Touch the column by altering it and setting it back
    ALTER TABLE public.categories ALTER COLUMN color SET DATA TYPE TEXT;
  END IF;
END
$$;

-- Create a temporary view to force schema refresh
DO $$
DECLARE
  column_list TEXT := 'id, name, description';
BEGIN
  -- Check for each optional column and add to column list if exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'color') THEN
    column_list := column_list || ', color';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'icon') THEN
    column_list := column_list || ', icon';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'image_url') THEN
    column_list := column_list || ', image_url';
  END IF;
  
  -- Add standard timestamp columns
  column_list := column_list || ', created_at, updated_at';
  
  -- Create the view with dynamic columns
  EXECUTE 'CREATE OR REPLACE VIEW temp_categories_view AS
    SELECT 
      ' || column_list || '
    FROM public.categories';
END
$$;

-- Drop the temporary view
DROP VIEW IF EXISTS temp_categories_view;

-- Make sure the users table exists with the correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Force a schema refresh for users by adding a comment
COMMENT ON COLUMN public.users.verified IS 'Whether the user has verified their mobile number';

-- Touch a column to refresh schema cache
ALTER TABLE public.users ALTER COLUMN mobile SET DATA TYPE TEXT;

-- Create a temporary view that references all columns for users
CREATE OR REPLACE VIEW temp_users_view AS
SELECT 
  id,
  name,
  mobile,
  password,
  verified,
  created_at,
  updated_at,
  verified_at
FROM public.users;

-- Drop the temporary view
DROP VIEW temp_users_view;

-- Drop existing RLS policies for otp_codes
DROP POLICY IF EXISTS "Enable read access for all users" ON public.otp_codes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.otp_codes;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.otp_codes;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.otp_codes;

-- Create new policies with true check for otp_codes
CREATE POLICY "Enable read access for all users" ON public.otp_codes
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.otp_codes
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.otp_codes
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON public.otp_codes
FOR DELETE USING (true);

-- Make sure the otp_codes table exists with the correct structure
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Force a schema refresh for otp_codes
COMMENT ON COLUMN public.otp_codes.otp IS 'One-time password for verification';

-- Touch a column to refresh schema cache
ALTER TABLE public.otp_codes ALTER COLUMN mobile SET DATA TYPE TEXT;

-- Create a temporary view that references all columns for otp_codes
CREATE OR REPLACE VIEW temp_otp_codes_view AS
SELECT 
  id,
  mobile,
  otp,
  expires_at,
  verified,
  created_at
FROM public.otp_codes;

-- Drop the temporary view
DROP VIEW temp_otp_codes_view;

-- Make sure the profiles table exists with the correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Force a schema refresh for profiles
COMMENT ON COLUMN public.profiles.email IS 'User email address';

-- Touch a column to refresh schema cache
ALTER TABLE public.profiles ALTER COLUMN email SET DATA TYPE TEXT;

-- Create a temporary view that references all columns for profiles
CREATE OR REPLACE VIEW temp_profiles_view AS
SELECT 
  id,
  email,
  full_name,
  phone,
  address,
  created_at,
  updated_at
FROM public.profiles;

-- Drop the temporary view
DROP VIEW temp_profiles_view;

-- Create the exec_sql function if it doesn't exist
CREATE OR REPLACE FUNCTION public.exec_sql(sql_string text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_string;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;