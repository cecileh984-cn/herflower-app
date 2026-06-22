drop policy if exists "Conversation members can read conversations" on public.conversations;

create policy "Approved conversation members can read conversations"
on public.conversations for select
using (
  public.is_admin()
  or (
    public.is_approved()
    and auth.uid() in (user_a, user_b)
  )
);

drop policy if exists "Conversation members can read messages" on public.messages;

create policy "Approved conversation members can read messages"
on public.messages for select
using (
  public.is_admin()
  or (
    public.is_approved()
    and exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and auth.uid() in (conversations.user_a, conversations.user_b)
    )
  )
);
