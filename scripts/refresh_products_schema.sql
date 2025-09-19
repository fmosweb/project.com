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
  images TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Force a schema refresh by altering the table and adding a comment
COMMENT ON COLUMN public.products.image_url IS 'URL for the product image';

-- Alternative approach: touch the column by altering it and setting it back
ALTER TABLE public.products ALTER COLUMN image_url SET DATA TYPE TEXT;

-- Another approach: create a temporary view that references all columns
CREATE OR REPLACE VIEW temp_products_view AS
SELECT 
  id,
  name,
  description,
  price,
  original_price,
  category,
  brand,
  stock,
  stock_quantity,
  sku,
  weight,
  dimensions,
  is_active,
  is_featured,
  tags,
  features,
  images,
  image_url,
  created_at,
  updated_at
FROM public.products;

-- Drop the temporary view
DROP VIEW temp_products_view;