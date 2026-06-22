import { getCurrentUser, ProfileRow } from "./profile";
import { supabase } from "./supabase";

export type ConversationRow = {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
  last_message_at: string | null;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  reported: boolean;
  created_at: string;
};

export type ConversationPreview = ConversationRow & {
  currentUserId: string;
  otherProfile: ProfileRow | null;
  lastMessage: MessageRow | null;
};

export type ConversationContext = ConversationRow & {
  currentUserId: string;
  otherUserId: string;
  otherProfile: ProfileRow | null;
  blockedByMe: boolean;
};

export async function listDiscoverProfiles() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Log in first to discover members.");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("review_status", "approved")
    .neq("id", user.id)
    .order("created_at", { ascending: false })
    .returns<ProfileRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getOrCreateConversation(otherUserId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Log in first to start a conversation.");

  const { data: existing, error: existingError } = await supabase
    .from("conversations")
    .select("*")
    .or(`and(user_a.eq.${user.id},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${user.id})`)
    .maybeSingle<ConversationRow>();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_a: user.id,
      user_b: otherUserId,
      last_message_at: new Date().toISOString()
    })
    .select("*")
    .single<ConversationRow>();

  if (error) throw error;
  return data;
}

export async function listConversations() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Log in first to view messages.");

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .returns<ConversationRow[]>();

  if (error) throw error;
  if (!conversations?.length) return [];

  const otherUserIds = conversations.map((conversation) => conversation.user_a === user.id ? conversation.user_b : conversation.user_a);
  const conversationIds = conversations.map((conversation) => conversation.id);

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", otherUserIds)
    .returns<ProfileRow[]>();

  if (profilesError) throw profilesError;

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false })
    .returns<MessageRow[]>();

  if (messagesError) throw messagesError;

  return conversations.map((conversation) => {
    const otherUserId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a;
    return {
      ...conversation,
      currentUserId: user.id,
      otherProfile: profiles?.find((profile) => profile.id === otherUserId) ?? null,
      lastMessage: messages?.find((message) => message.conversation_id === conversation.id) ?? null
    };
  });
}

export async function getConversation(conversationId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle<ConversationRow>();

  if (error) throw error;
  return data;
}

export async function getConversationContext(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Log in first to view this conversation.");

  const conversation = await getConversation(conversationId);
  if (!conversation) return null;

  if (![conversation.user_a, conversation.user_b].includes(user.id)) {
    throw new Error("You are not a member of this conversation.");
  }

  const otherUserId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", otherUserId)
    .maybeSingle<ProfileRow>();

  if (profileError) throw profileError;

  const { data: block, error: blockError } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", user.id)
    .eq("blocked_id", otherUserId)
    .maybeSingle<{ blocked_id: string }>();

  if (blockError) throw blockError;

  return {
    ...conversation,
    currentUserId: user.id,
    otherUserId,
    otherProfile: profile ?? null,
    blockedByMe: Boolean(block)
  };
}

export async function listMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .returns<MessageRow[]>();

  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(conversationId: string, body: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Log in first to send a message.");

  const conversation = await getConversation(conversationId);
  if (!conversation) throw new Error("Conversation not found.");
  const otherUserId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a;

  const { data: block } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", user.id)
    .eq("blocked_id", otherUserId)
    .maybeSingle<{ blocked_id: string }>();

  if (block) throw new Error("You blocked this member. Unblock her before sending a message.");

  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body
    });

  if (error) throw error;

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);
}

export async function reportMessage(messageId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Log in first to report a message.");

  await supabase
    .from("messages")
    .update({ reported: true })
    .eq("id", messageId);

  const { error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      target_type: "message",
      target_id: messageId,
      reason: "Message reported by a member"
    });

  if (error) throw error;
}

export async function blockConversationMember(conversationId: string) {
  const context = await getConversationContext(conversationId);
  if (!context) throw new Error("Conversation not found.");

  const { error } = await supabase
    .from("blocks")
    .upsert({
      blocker_id: context.currentUserId,
      blocked_id: context.otherUserId
    });

  if (error) throw error;
}

export async function unblockConversationMember(conversationId: string) {
  const context = await getConversationContext(conversationId);
  if (!context) throw new Error("Conversation not found.");

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", context.currentUserId)
    .eq("blocked_id", context.otherUserId);

  if (error) throw error;
}

export async function reportConversationMember(conversationId: string, reason: string) {
  const context = await getConversationContext(conversationId);
  if (!context) throw new Error("Conversation not found.");

  const { error } = await supabase
    .from("reports")
    .insert({
      reporter_id: context.currentUserId,
      reported_user_id: context.otherUserId,
      target_type: "user",
      target_id: context.otherUserId,
      reason
    });

  if (error) throw error;
}
