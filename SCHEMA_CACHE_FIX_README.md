# Supabase Schema Cache Fix

## Problem

The admin categories page is showing an error: **"could not find the 'color' column of 'categories' in the schema cache"**

This error occurs when Supabase's internal schema cache is out of sync with the actual database schema. Even though the `color` column exists in the database table (as defined in `scripts/005_create_categories_table.sql`), Supabase's client is not recognizing it.

## Solution

We've created scripts to refresh the schema cache by performing operations that force Supabase to update its internal schema representation.

### Option 1: Run the Fix Script

The easiest way to fix this issue is to run the provided script:

```bash
npm run refresh-schema
```

This script:
1. Connects to Supabase using the service role key
2. Executes SQL commands that force a schema cache refresh
3. Confirms when the operation is complete

### Option 2: Manual SQL Execution

If the script doesn't work, you can manually execute the SQL commands:

1. Go to the Supabase dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `scripts/007_refresh_schema_cache.sql`
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

These operations force Supabase to update its internal schema cache without changing the actual database structure.

## Prevention

This issue typically occurs when:

1. The database schema is modified outside of Supabase's interface
2. There are synchronization issues between Supabase's cache and the actual database

To prevent this in the future, consider:

- Using Supabase migrations for schema changes
- Running the refresh script after major schema changes
- Restarting the Supabase client after schema modifications