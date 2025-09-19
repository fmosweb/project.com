# Admin Access Fix for Categories and Products

## Problem
The admin interface is unable to add categories and products due to restrictive Row Level Security (RLS) policies in the Supabase database.

## Solution
We've created a fix that updates the RLS policies to allow admin operations. There are two ways to apply this fix:

### Option 1: Run the Fix Script

1. Make sure your `.env.local` file has the correct Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the fix script:
   ```bash
   npm run fix-categories
   ```
   
   > **Note:** The script has been updated to use ES modules (.mjs extension) for better compatibility with Node.js.

### Option 2: Manual SQL Execution

If the script doesn't work, you can manually run the SQL in the Supabase dashboard:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `scripts/006_fix_categories_rls.sql`
4. Run the SQL

## What the Fix Does

The fix removes the restrictive RLS policies on the categories table and replaces them with policies that allow admin operations. The SQL script:

1. Drops the existing restrictive policies
2. Creates new policies that allow insert, update, and delete operations

## Verification

After applying the fix, you should be able to:
1. Add new categories in the admin interface
2. Add new products in the admin interface

## Additional Notes

We also fixed a typo in the Supabase client configuration (`process.evn` → `process.env`) which may have been contributing to connection issues.