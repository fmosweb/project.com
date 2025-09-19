# How to Fix the Schema Cache Issue

## Problem

The admin categories page is showing an error: **"could not find the 'color' column of 'categories' in the schema cache"**

This error occurs when Supabase's internal schema cache is out of sync with the actual database schema. Even though the `color` column exists in the database table, Supabase's client is not recognizing it.

## Solution

### Option 1: Execute SQL Commands in Supabase Dashboard

1. Run the following command to display the SQL fix:
   ```bash
   npm run show-schema-fix
   ```

2. Copy the displayed SQL commands

3. Go to the Supabase dashboard

4. Open the SQL Editor

5. Paste and execute the SQL commands

6. Restart your Next.js development server:
   ```bash
   npm run dev
   ```

### Option 2: Manual SQL Execution

If Option 1 doesn't work, you can manually execute the SQL commands:

1. Go to the Supabase dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `scripts/fix_categories_schema_cache.sql`
4. Execute the SQL

## Verification

After running the fix:

1. Restart your Next.js development server (`npm run dev`)
2. Navigate to the admin categories page
3. The error should be resolved, and you should be able to add and manage categories

## Technical Details

The fix works by:

1. Ensuring the table exists with the correct structure
2. Adding a comment to the `color` column
3. Altering the column's data type (to the same type) to force a schema refresh
4. Creating and dropping a temporary view that references all columns