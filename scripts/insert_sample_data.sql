-- Insert sample data after running clean_database_setup.sql

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
