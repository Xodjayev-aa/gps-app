-- Run once in your own Supabase SQL editor. Never expose a service_role key.
create table if not exists public.backups (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null check (octet_length(payload::text) <= 200000),
  terms_version text not null,
  updated_at timestamptz not null default now()
);
alter table public.backups enable row level security;
revoke all on public.backups from anon;
grant select, insert, update, delete on public.backups to authenticated;
create policy "own backup select" on public.backups for select to authenticated using ((select auth.uid()) = user_id);
create policy "own backup insert" on public.backups for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own backup update" on public.backups for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own backup delete" on public.backups for delete to authenticated using ((select auth.uid()) = user_id);
-- Self-service deletion with no browser-side admin key. No arbitrary user parameter.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
