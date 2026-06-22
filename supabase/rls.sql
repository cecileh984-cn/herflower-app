alter table public.profiles enable row level security;
alter table public.verifications enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

create or replace function public.is_approved()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and review_status = 'approved'
  );
$$;

create policy "Profiles are readable by approved users and self"
on public.profiles for select
using (
  id = auth.uid()
  or public.is_approved()
  or public.is_admin()
);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can update profiles"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

create policy "Users can insert their own verification"
on public.verifications for insert
with check (user_id = auth.uid());

create policy "Users can view their own verification"
on public.verifications for select
using (user_id = auth.uid() or public.is_admin());

create policy "Admins can update verifications"
on public.verifications for update
using (public.is_admin())
with check (public.is_admin());

create policy "Approved users can read visible posts"
on public.posts for select
using ((hidden = false and public.is_approved()) or public.is_admin());

create policy "Approved users can create posts"
on public.posts for insert
with check (author_id = auth.uid() and public.is_approved());

create policy "Authors can update their own posts"
on public.posts for update
using (author_id = auth.uid())
with check (author_id = auth.uid());

create policy "Admins can update posts"
on public.posts for update
using (public.is_admin())
with check (public.is_admin());

create policy "Approved users can read visible comments"
on public.comments for select
using ((hidden = false and public.is_approved()) or public.is_admin());

create policy "Approved users can create comments"
on public.comments for insert
with check (author_id = auth.uid() and public.is_approved());

create policy "Authors can update their own comments"
on public.comments for update
using (author_id = auth.uid())
with check (author_id = auth.uid());

create policy "Admins can update comments"
on public.comments for update
using (public.is_admin())
with check (public.is_admin());

create policy "Conversation members can read conversations"
on public.conversations for select
using (auth.uid() in (user_a, user_b) or public.is_admin());

create policy "Approved users can create conversations"
on public.conversations for insert
with check (
  public.is_approved()
  and auth.uid() in (user_a, user_b)
);

create policy "Conversation members can read messages"
on public.messages for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and auth.uid() in (conversations.user_a, conversations.user_b)
  )
);

create policy "Conversation members can send messages"
on public.messages for insert
with check (
  sender_id = auth.uid()
  and public.is_approved()
  and exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and auth.uid() in (conversations.user_a, conversations.user_b)
  )
);

create policy "Users can create reports"
on public.reports for insert
with check (reporter_id = auth.uid());

create policy "Users can read their own reports"
on public.reports for select
using (reporter_id = auth.uid() or public.is_admin());

create policy "Admins can update reports"
on public.reports for update
using (public.is_admin())
with check (public.is_admin());

create policy "Users can manage their blocks"
on public.blocks for all
using (blocker_id = auth.uid())
with check (blocker_id = auth.uid());
