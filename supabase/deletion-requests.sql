create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  status public.report_status not null default 'open',
  requested_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.deletion_requests enable row level security;

drop policy if exists "Users can create their own deletion requests" on public.deletion_requests;
create policy "Users can create their own deletion requests"
on public.deletion_requests for insert
with check (user_id = auth.uid());

drop policy if exists "Users can read their own deletion requests" on public.deletion_requests;
create policy "Users can read their own deletion requests"
on public.deletion_requests for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can update deletion requests" on public.deletion_requests;
create policy "Admins can update deletion requests"
on public.deletion_requests for update
using (public.is_admin())
with check (public.is_admin());
