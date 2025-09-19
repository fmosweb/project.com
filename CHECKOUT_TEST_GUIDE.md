# 🧪 অর্ডার/চেকআউট টেস্ট গাইড

## ✅ প্রি-রেকুইজিট
- .env.local সঠিকভাবে সেট আছে কিনা নিশ্চিত করুন
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - রেফারেন্স: `env-example.txt`
- ডাটাবেস স্কিমা রান হয়েছে কিনা নিশ্চিত করুন
  - সুপারিশ: `scripts/clean_database_setup.sql`
  - স্যাম্পল ডাটা দিতে চাইলে: `scripts/insert_sample_data.sql`

## 🧭 টেস্ট রুটস
- Checkout: `http://localhost:3000/checkout`
- Order Creation Test: `http://localhost:3000/test-order-creation`

## 🚀 টেস্ট করার ধাপ
1) ব্রাউজারে `http://localhost:3000/test-order-creation` খুলুন
   - “Test Order Creation” বাটনে ক্লিক করুন
   - সফল হলে JSON-এ `success: true` এবং `id: <uuid>` দেখতে পাবেন
2) `http://localhost:3000/checkout` পেজে যান
   - প্রয়োজনীয় ফিল্ডগুলো পূরণ করুন
   - পেমেন্ট মেথড হিসেবে Cash on Delivery সিলেক্ট করুন
   - “Place Order” বাটনে ক্লিক করুন
   - সফল হলে `/checkout/success?orderId=<uuid>&method=cod` এ রিডাইরেক্ট হবে

## 🔧 টেকনিক্যাল নোটস (কোড রেফারেন্স)
- অর্ডার API: `app/api/orders/create/route.ts`
  - DB-কে নিজে থেকে UUID জেনারেট করতে দেয় (ম্যানুয়াল স্ট্রিং আইডি নয়)
  - `payment_method` normalize করা হয়েছে: `cash-on-delivery` → `cash_on_delivery`
  - মক কার্ট আইটেমে `id` সংখ্যা হতে পারে; valid UUID না হলে `order_items` ইনসার্ট স্কিপ হয় (অর্ডার তৈরি তবুও হবে)
- Supabase Admin Client: `lib/supabase/admin.ts`
  - `.env.local` না থাকলে mock client ব্যবহৃত হয় এবং insert ব্যর্থ হয়

## ✅ এক্সপেক্টেড রেজাল্ট
- `/api/orders/create` রেসপন্স: `{ success: true, id: <uuid>, order: {...} }`
- COD হলে সরাসরি Success পেজে রিডাইরেক্ট
- Admin panel (Orders) এ নতুন অর্ডার দেখা যাবে

## 🐛 ট্রাবলশুটিং
- 500: “অর্ডার তৈরিতে সমস্যা হয়েছে”
  - `.env.local` এর কী-গুলো সঠিক কিনা চেক করুন
  - Supabase স্কিমা সঠিক কিনা নিশ্চিত করুন (`scripts/clean_database_setup.sql`)
  - API রেসপন্সে `details`/`code` থাকলে সেটি দেখে ব্যবস্থা নিন
- 404 ইমেজ → UI অ্যাসেট মিসিং, অর্ডার তৈরিতে বাধা নয়
- bKash/Nagad/Rocket → বর্তমানে placeholder redirect; টেস্টে COD ব্যবহার করুন

## 🧪 Supabase কানেকশন টেস্ট (ঐচ্ছিক)
- স্ক্রিপ্ট: `test-supabase.js`
- রান করুন:
  - `node test-supabase.js`
  - আউটপুটে URL/Key সেট আছে কিনা এবং `products` select রেসপন্স দেখুন

## ℹ️ নোট
- মক কার্ট (`/checkout`) আইটেমগুলোর `id` সংখ্যা হওয়ায় `order_items` ইনসার্ট স্কিপ হতে পারে। প্রোডাকশনে আসল প্রোডাক্ট UUID ব্যবহার করলে আইটেমগুলোও ইনসার্ট হবে।
