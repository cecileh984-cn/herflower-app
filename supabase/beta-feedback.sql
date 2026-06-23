create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null default 'general',
  message text not null,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.beta_feedback enable row level security;

drop policy if exists "Users can create their own beta feedback" on public.beta_feedback;
create policy "Users can create their own beta feedback"
on public.beta_feedback for insert
with check (user_id = auth.uid());

drop policy if exists "Users can read their own beta feedback" on public.beta_feedback;
create policy "Users can read their own beta feedback"
on public.beta_feedback for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can update beta feedback" on public.beta_feedback;
create policy "Admins can update beta feedback"
on public.beta_feedback for update
using (public.is_admin())
with check (public.is_admin());
