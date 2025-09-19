-- RPC to get current database size in bytes
-- Run this in Supabase SQL editor or psql
create or replace function public.get_db_size()
returns bigint
language sql
stable
as $$
  select pg_database_size(current_database());
$$;

-- Optional: grant execute to authenticated role only (API routes should use service role)
grant execute on function public.get_db_size() to authenticated;
-- Do NOT grant to anon in production unless you explicitly want it
-- grant execute on function public.get_db_size() to anon;
