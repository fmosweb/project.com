-- Ensure users table supports email-only accounts and enforces 1 email = 1 user
-- Run in Supabase SQL Editor. Review and backup before running in production.

-- 0) Enable UUID generator (if not already)
create extension if not exists pgcrypto;

-- 1) Make sure optional fields won't block minimal email-only insert
--    Drop NOT NULL from mobile if present; drop password column (or its NOT NULL)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='users' AND column_name='mobile'
  ) THEN
    EXECUTE 'alter table public.users alter column mobile drop not null';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='users' AND column_name='password'
  ) THEN
    -- Drop the column entirely; comment out if you prefer to keep it optional only
    EXECUTE 'alter table public.users drop column if exists password';
    -- To keep it (optional), use instead:
    -- EXECUTE ''alter table public.users alter column password drop not null'';
  END IF;
END $$;

-- 2) Ensure required columns exist
alter table public.users
  add column if not exists verified boolean default false,
  add column if not exists created_at timestamp with time zone default now(),
  add column if not exists updated_at timestamp with time zone default now();

-- 3) Deduplicate existing users by case-insensitive email
--    Keep the most useful row per email: prefer verified=true, then oldest created_at
BEGIN;
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY lower(trim(email))
      ORDER BY verified DESC, created_at ASC
    ) AS rn
  FROM public.users
)
DELETE FROM public.users u
USING ranked r
WHERE u.id = r.id AND r.rn > 1;

-- 4) Normalize all emails to lowercase (trimmed)
update public.users
set email = lower(trim(email))
where email <> lower(trim(email));

-- 5) Enforce uniqueness: 1 email = 1 user
--    Use a UNIQUE constraint on the email column (now normalized to lowercase)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND conname = 'users_email_unique'
  ) THEN
    EXECUTE 'alter table public.users add constraint users_email_unique unique (email)';
  END IF;
END $$;

COMMIT;

-- 6) Quick checks
-- SELECT id, email, verified, created_at FROM public.users ORDER BY created_at DESC LIMIT 20;
-- SELECT lower(email) AS email_key, COUNT(*) FROM public.users GROUP BY 1 HAVING COUNT(*) > 1; -- should return 0 rows
