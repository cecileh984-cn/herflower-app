create or replace function public.can_send_message(target_conversation_id uuid, sender uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversations
    where conversations.id = target_conversation_id
      and sender in (conversations.user_a, conversations.user_b)
      and not exists (
        select 1
        from public.blocks
        where (
          blocks.blocker_id = conversations.user_a
          and blocks.blocked_id = conversations.user_b
        )
        or (
          blocks.blocker_id = conversations.user_b
          and blocks.blocked_id = conversations.user_a
        )
      )
  );
$$;

drop policy if exists "Conversation members can send messages" on public.messages;

create policy "Conversation members can send messages"
on public.messages for insert
with check (
  sender_id = auth.uid()
  and public.is_approved()
  and public.can_send_message(conversation_id, auth.uid())
);

create policy "Conversation members can report messages"
on public.messages for update
using (
  exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and auth.uid() in (conversations.user_a, conversations.user_b)
  )
)
with check (
  exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and auth.uid() in (conversations.user_a, conversations.user_b)
  )
);
