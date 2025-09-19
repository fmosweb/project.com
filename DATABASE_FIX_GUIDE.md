# 🚨 URGENT: Database Fix Required

## সমস্যা:
Terminal logs দেখাচ্ছে যে `users` table এ `password` column নেই:
```
Could not find the 'password' column of 'users' in the schema cache
```

## সমাধান:

### Step 1: Supabase SQL Editor এ যান
1. **Supabase Dashboard** এ যান
2. **SQL Editor** এ যান
3. **New Query** তৈরি করুন

### Step 2: এই SQL Commands চালান:

```sql
-- Add password column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add index for password column (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_password ON users(password);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

### Step 3: Table Structure Verify করুন
উপরের query চালানোর পর আপনি দেখতে পাবেন:
- `id` (uuid)
- `name` (text)
- `email` (text)
- `mobile` (text)
- `password` (varchar) ← **এই column যোগ হয়েছে**
- `verified` (boolean)
- `created_at` (timestamp)

### Step 4: Test করুন
1. **Website refresh করুন**
2. **Registration form fill করুন:**
   - Name: Test User
   - Email: test@example.com
   - Mobile: 01712345678
   - Password: Test123

3. **"একাউন্ট তৈরি করুন" button click করুন**

### Step 5: Expected Console Output:
```
[v1] Registration request: {name: "Test User", email: "test@example.com", mobile: "01712345678"}
[v1] Creating user...
[v1] Inserting user data: {name: "Test User", email: "test@example.com", mobile: "01712345678", password: "***", verified: false}
[v1] User created successfully: [user-id]
[v1] Generated OTP: [6-digit-code]
📧 [EMAIL] OTP CODE FOR TESTING: [6-digit-code]
```

## 🔧 Additional Fixes Applied:

1. **✅ Better Error Logging**: Registration API তে detailed logging যোগ করা হয়েছে
2. **✅ Password Field Validation**: Auth service এ password validation যোগ করা হয়েছে
3. **✅ Mobile Field Debugging**: Empty mobile field issue debug করা হয়েছে

## 🚨 Important Notes:

- **Password column যোগ করার পর** registration কাজ করবে
- **OTP code console এ দেখতে পাবেন** development mode এ
- **Admin panel এ users দেখতে পাবেন** verification এর পর

## 📞 যদি সমস্যা থাকে:

1. **Supabase connection check করুন**
2. **Table permissions verify করুন**
3. **Console logs check করুন**
4. **Database schema refresh করুন**

**এই fix করার পর registration system সম্পূর্ণভাবে কাজ করবে!** 🚀
