# 🚀 Database Table Creation Guide

## 🎯 সমস্যা: "Database এ table নেই"

### ✅ সমাধান: Database Tables Create করুন!

## 🔧 Step-by-Step Solution:

### Step 1: Open Supabase
1. **Go to**: https://supabase.com
2. **Login** to your account
3. **Select** your project
4. **Click**: "SQL Editor" (left sidebar)

### Step 2: Run SQL Script
1. **Copy** the entire SQL script from `database/create_tables.sql`
2. **Paste** in Supabase SQL Editor
3. **Click**: "Run" button

### Step 3: Verify Tables Created
1. **Check**: Tables should be created successfully
2. **Look for**: Success message
3. **Verify**: Row counts at the bottom

## 🔧 SQL Script to Run:

```sql
-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create otp_codes table
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_otp ON otp_codes(otp);

-- 5. Add constraints
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_email_unique UNIQUE (email);
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_mobile_unique UNIQUE (mobile);
```

## 🔧 Alternative: Run Individual Commands

### If the full script doesn't work, run these one by one:

```sql
-- 1. Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

```sql
-- 2. Create otp_codes table
CREATE TABLE otp_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

```sql
-- 3. Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Verify Tables Created:

### Check Tables:
```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check Users Table:
```sql
-- Check users table structure
\d users;
```

### Check Row Counts:
```sql
-- Count rows in each table
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'otp_codes' as table_name, COUNT(*) as row_count FROM otp_codes
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles;
```

## 🚨 Troubleshooting:

### Issue 1: Permission Denied
**Solution**: Make sure you're logged in as project owner

### Issue 2: Table Already Exists
**Solution**: Use `CREATE TABLE IF NOT EXISTS` (already in script)

### Issue 3: UUID Extension Missing
**Solution**: Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue 4: Syntax Error
**Solution**: Run commands one by one instead of full script

## 🚀 After Creating Tables:

### 1. Test Registration
1. **Go to**: http://localhost:3000
2. **Register** a new account
3. **Check**: Server console logs

### 2. Test Admin Panel
1. **Go to**: http://localhost:3000/simple-admin-test
2. **Click**: "Test Admin API"
3. **Verify**: Users appear in list

### 3. Test Database
1. **Click**: "Test Database Direct"
2. **Verify**: Database connection works

## 🎯 Expected Results:

### ✅ After Running SQL:
```
✅ Tables created successfully
✅ Indexes created
✅ Constraints added
✅ Test data inserted (optional)
```

### ✅ After Testing:
```
✅ Registration works
✅ Users saved in database
✅ Admin panel shows users
✅ All systems working
```

## 🚀 Ready to Fix!

**Steps**:
1. **Open Supabase SQL Editor**
2. **Run the SQL script**
3. **Test the system**

**Database tables will be created and everything will work!** 🎉

**Run the SQL script and let me know what happens!** 🛠️
