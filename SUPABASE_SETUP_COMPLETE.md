# 🗄️ Supabase Database Setup - Permanent Data Storage

## ধাপ ১: Supabase Database Setup

### SQL Scripts রান করুন (Supabase SQL Editor এ):

#### ১. প্রথমে এই script রান করুন:
```sql
-- Clean Database Setup for FMOS WINSARF AI E-commerce
-- Run this script in Supabase SQL Editor

-- Drop existing tables if they exist (in correct order to avoid foreign key issues)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT UNIQUE,
  image_url TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  parent_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  brand TEXT,
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  weight DECIMAL(8,2),
  dimensions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  mobile TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  address TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_orders_status ON public.orders(order_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_users_mobile ON public.users(mobile);
CREATE INDEX idx_users_email ON public.users(email);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Categories: Public read access
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Products: Public read access for active products
CREATE POLICY "Active products are viewable by everyone" ON public.products FOR SELECT USING (is_active = true);

-- Users: Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Profiles: Users can only see their own data
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles are updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Orders: Users can only see their own orders
CREATE POLICY "Orders are viewable by owner" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Order items are viewable by owner" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
```

#### ২. তারপর sample data insert করুন:
```sql
-- Insert sample categories
INSERT INTO public.categories (name, description, slug, icon, color) VALUES
('ইলেকট্রনিক্স', 'ইলেকট্রনিক পণ্য এবং গ্যাজেট', 'electronics', 'Smartphone', '#3B82F6'),
('ফ্যাশন', 'পোশাক এবং ফ্যাশন আইটেম', 'fashion', 'Shirt', '#EC4899'),
('বই', 'বই এবং শিক্ষামূলক উপকরণ', 'books', 'Book', '#10B981'),
('খেলাধুলা', 'খেলাধুলার সামগ্রী', 'sports', 'Dumbbell', '#F59E0B'),
('বাড়ি ও বাগান', 'বাড়ি এবং বাগানের জিনিসপত্র', 'home-garden', 'Home', '#8B5CF6');

-- Insert sample products
INSERT INTO public.products (name, description, price, original_price, category, brand, stock, is_active, is_featured, tags, features, images) VALUES
('প্রিমিয়াম ওয়্যারলেস হেডফোন', 'উচ্চ মানের সাউন্ড এবং দীর্ঘস্থায়ী ব্যাটারি সহ প্রিমিয়াম ওয়্যারলেস হেডফোন। নয়েজ ক্যান্সেলেশন এবং কমফোর্টেবল ডিজাইন।', 299.99, 399.99, 'ইলেকট্রনিক্স', 'TechPro', 15, true, true, ARRAY['wireless', 'premium', 'noise-cancelling'], ARRAY['40mm ড্রাইভার', '30 ঘন্টা ব্যাটারি লাইফ', 'অ্যাক্টিভ নয়েজ ক্যান্সেলেশন', 'ব্লুটুথ 5.0', 'ফাস্ট চার্জিং'], ARRAY['/premium-wireless-headphones.png']),

('গেমিং মেকানিক্যাল কীবোর্ড', 'প্রফেশনাল গেমারদের জন্য RGB ব্যাকলাইট সহ মেকানিক্যাল কীবোর্ড। ব্লু সুইচ এবং অ্যান্টি-গোস্টিং ফিচার।', 149.99, 199.99, 'ইলেকট্রনিক্স', 'GameMaster', 8, true, false, ARRAY['gaming', 'mechanical', 'rgb'], ARRAY['মেকানিক্যাল ব্লু সুইচ', 'RGB ব্যাকলাইট', 'অ্যান্টি-গোস্টিং', 'USB-C কানেকশন', 'প্রোগ্রামেবল কী'], ARRAY['/gaming-mechanical-keyboard.png']),

('স্মার্ট ফিটনেস ট্র্যাকার', 'হার্ট রেট মনিটরিং, স্লিপ ট্র্যাকিং এবং ওয়াটারপ্রুফ ডিজাইন সহ স্মার্ট ফিটনেস ব্যান্ড।', 89.99, 129.99, 'ইলেকট্রনিক্স', 'FitTech', 25, true, true, ARRAY['fitness', 'smartwatch', 'waterproof'], ARRAY['হার্ট রেট মনিটর', 'স্লিপ ট্র্যাকিং', 'IP68 ওয়াটারপ্রুফ', '7 দিন ব্যাটারি', 'স্মার্ট নোটিফিকেশন'], ARRAY['/fitness-tracker-lifestyle.png']);

-- Insert sample users
INSERT INTO public.users (name, email, mobile, address, verified) VALUES
('আহমেদ হাসান', 'ahmed@example.com', '01712345678', 'ঢাকা, বাংলাদেশ', true),
('ফাতিমা খাতুন', 'fatima@example.com', '01823456789', 'চট্টগ্রাম, বাংলাদেশ', true),
('মোহাম্মদ রহিম', 'rahim@example.com', '01934567890', 'সিলেট, বাংলাদেশ', false);
```

## ধাপ ২: Environment Variables Setup

### `.env.local` ফাইল তৈরি করুন:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Instructions:
# 1. Go to your Supabase Dashboard
# 2. Navigate to Settings > API
# 3. Copy Project URL to NEXT_PUBLIC_SUPABASE_URL
# 4. Copy anon public key to NEXT_PUBLIC_SUPABASE_ANON_KEY
# 5. Copy service_role key to SUPABASE_SERVICE_ROLE_KEY
```

## ধাপ ৩: Server Restart
```bash
npm run dev
```

## ধাপ ৪: Test করুন

### Database Connection Test:
```
http://localhost:3000/api/test-database
```

### Admin Panel:
```
http://localhost:3000/admin
Email: admin@fmosweb.com
Password: admin123
```

## ✅ এখন যা হবে:

1. **Permanent Data Storage** - সব data Supabase database এ সংরক্ষিত হবে
2. **Real-time Updates** - data changes তাৎক্ষণিক দেখাবে
3. **Admin Panel** - সব CRUD operations কাজ করবে
4. **Website** - real database data দেখাবে
5. **User Registration** - admin panel এ দেখাবে
6. **Orders** - database এ সংরক্ষিত হয়ে admin এ দেখাবে

## 🎯 Features:

- ✅ Permanent data storage
- ✅ Real-time data synchronization
- ✅ Row Level Security (RLS)
- ✅ Proper indexing for performance
- ✅ Auto-updating timestamps
- ✅ Foreign key relationships
- ✅ Data validation

**Environment variables সেট করার পর সব কিছু real-time এ কাজ করবে!**
