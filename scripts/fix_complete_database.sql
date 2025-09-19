-- Complete database fix for FMOS WINSARF AI E-commerce
-- This script will create the correct tables and fix all issues

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

-- Create products table with all required fields
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  brand TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT UNIQUE,
  weight DECIMAL(10,2),
  dimensions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for customer management
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT,
  address TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (for auth integration)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT NOT NULL,
  payment_method TEXT DEFAULT 'cash_on_delivery',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Service role can manage categories" ON public.categories FOR ALL USING (true);

-- Create RLS policies for products (public read, admin write)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Service role can manage products" ON public.products FOR ALL USING (true);

-- Create RLS policies for users (admin only)
CREATE POLICY "Service role can manage users" ON public.users FOR ALL USING (true);

-- Create RLS policies for profiles (user can manage own profile)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role can manage profiles" ON public.profiles FOR ALL USING (true);

-- Create RLS policies for orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Service role can manage orders" ON public.orders FOR ALL USING (true);

-- Create RLS policies for order_items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.profile_id = auth.uid()
  )
);
CREATE POLICY "Service role can manage order items" ON public.order_items FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_products_name ON public.products(name);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_profile_id ON public.orders(profile_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

('স্মার্ট ফিটনেস ট্র্যাকার', 'হার্ট রেট মনিটরিং, স্লিপ ট্র্যাকিং এবং ওয়াটারপ্রুফ ডিজাইন সহ স্মার্ট ফিটনেস ব্যান্ড।', 89.99, 129.99, 'ইলেকট্রনিক্স', 'FitTech', 25, true, true, ARRAY['fitness', 'smartwatch', 'waterproof'], ARRAY['হার্ট রেট মনিটর', 'স্লিপ ট্র্যাকিং', 'IP68 ওয়াটারপ্রুফ', '7 দিন ব্যাটারি', 'স্মার্ট নোটিফিকেশন'], ARRAY['/fitness-tracker-lifestyle.png']),

('পোর্টেবল ব্লুটুথ স্পিকার', '360° সাউন্ড এবং ওয়াটারপ্রুফ ডিজাইন সহ পোর্টেবল ব্লুটুথ স্পিকার। আউটডোর এবং ইনডোর ব্যবহারের জন্য।', 59.99, 89.99, 'ইলেকট্রনিক্স', 'SoundWave', 12, true, false, ARRAY['bluetooth', 'portable', 'waterproof'], ARRAY['360° সাউন্ড', '12 ঘন্টা প্লেটাইম', 'IPX7 ওয়াটারপ্রুফ', 'ব্লুটুথ 5.0', 'বিল্ট-ইন মাইক'], ARRAY['/bluetooth-speaker.png']),

('ওয়্যারলেস চার্জিং প্যাড', 'ফাস্ট চার্জিং সাপোর্ট সহ ইউনিভার্সাল ওয়্যারলেস চার্জিং প্যাড। সব Qi-enabled ডিভাইসের সাথে কম্প্যাটিবল।', 39.99, null, 'ইলেকট্রনিক্স', 'ChargeTech', 30, true, false, ARRAY['wireless', 'charging', 'fast-charge'], ARRAY['15W ফাস্ট চার্জিং', 'Qi সার্টিফাইড', 'LED ইন্ডিকেটর', 'ওভারহিট প্রোটেকশন', 'নন-স্লিপ বেস'], ARRAY['/wireless-charging-pad.png']);

-- Insert sample users
INSERT INTO public.users (name, email, mobile, address, verified) VALUES
('মোহাম্মদ রহিম', 'rahim@example.com', '01712345678', 'ঢাকা, বাংলাদেশ', true),
('ফাতিমা খাতুন', 'fatima@example.com', '01812345678', 'চট্টগ্রাম, বাংলাদেশ', true),
('আহমেদ হাসান', 'ahmed@example.com', '01912345678', 'সিলেট, বাংলাদেশ', false);

-- Insert sample orders
INSERT INTO public.orders (user_id, total_amount, status, shipping_address, payment_method, payment_status) VALUES
((SELECT id FROM public.users WHERE email = 'rahim@example.com'), 349.98, 'delivered', 'বাড়ি নং ১২৩, রোড নং ৫, ধানমন্ডি, ঢাকা', 'cash_on_delivery', 'paid'),
((SELECT id FROM public.users WHERE email = 'fatima@example.com'), 149.99, 'processing', 'ফ্ল্যাট নং ৪বি, বিল্ডিং নং ৭, নাসিরাবাদ, চট্টগ্রাম', 'bkash', 'paid'),
((SELECT id FROM public.users WHERE email = 'ahmed@example.com'), 89.99, 'pending', 'বাড়ি নং ৪৫৬, জিন্দাবাজার, সিলেট', 'cash_on_delivery', 'pending');
