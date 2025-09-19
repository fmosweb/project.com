-- Fix users table by adding missing password column
-- Run these SQL commands in your Supabase SQL editor

-- Add password column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add index for password column (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_password ON users(password);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
