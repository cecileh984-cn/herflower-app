"use client";

import { FormEvent, useEffect, useState } from "react";
import { RequireApproved } from "../../components/AccessGate";
import { AppShell } from "../../components/AppShell";
import { Avatar } from "../../components/Avatar";
import {
  blockConversationMember,
  ConversationContext,
  getConversationContext,
  listMessages,
  MessageRow,
  reportConversationMember,
  reportMessage,
  sendMessage,
  unblockConversationMember
} from "../../lib/chat";

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [conversation, setConversation] = useState<ConversationContext | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [draft, setDraft] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refreshMessages(options: { silent?: boolean } = {}) {
    if (!options.silent) {
      setIsLoading(true);
      setStatusMessage("");
    }

    try {
      const nextConversation = await getConversationContext(params.id);
      setConversation(nextConversation);
      setCurrentUserId(nextConversation?.currentUserId ?? "");
      if (!nextConversation) {
        setMessages([]);
        setStatusMessage("Conversation not found.");
        return;
      }
      setMessages(await listMessages(params.id));
      setLastRefreshedAt(new Date().toLocaleTimeString());
    } catch (error) {
      if (!options.silent) {
        setStatusMessage(error instanceof Error ? error.message : "Could not load chat.");
      }
    } finally {
      if (!options.silent) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    refreshMessages();
    const interval = window.setInterval(() => {
      refreshMessages({ silent: true });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [params.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await sendMessage(params.id, draft);
      setDraft("");
      await refreshMessages();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not send message.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReport(messageId: string) {
    try {
      await reportMessage(messageId);
      setStatusMessage("Message reported.");
      await refreshMessages();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not report message.");
    }
  }

  async function handleReportUser() {
    try {
      await reportConversationMember(params.id, "Member reported from private chat");
      setStatusMessage("Member report submitted.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not report this member.");
    }
  }

  async function handleBlockUser() {
    try {
      await blockConversationMember(params.id);
      setStatusMessage("Member blocked. You cannot send more messages unless you unblock her.");
      await refreshMessages();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not block this member.");
    }
  }

  async function handleUnblockUser() {
    try {
      await unblockConversationMember(params.id);
      setStatusMessage("Member unblocked.");
      await refreshMessages();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not unblock this member.");
    }
  }

  const otherName = conversation?.otherProfile?.display_name ?? "HerFlower member";
  const otherLocation = [conversation?.otherProfile?.city, conversation?.otherProfile?.country].filter(Boolean).join(", ");
  const otherLanguages = conversation?.otherProfile?.languages_spoken?.join(", ");

  return (
    <AppShell>
      <RequireApproved>
        <div className="content">
          <div className="section-head">
            <div>
              <h2>{otherName}</h2>
              <p className="lead">
                {[otherLocation || "Global member", otherLanguages || "Verified member"].filter(Boolean).join(" - ")}
              </p>
            </div>
            <div className="actions">
              <button className="btn btn-secondary" onClick={() => refreshMessages()}>Refresh</button>
              <button className="btn btn-secondary" onClick={handleReportUser}>Report user</button>
              {conversation?.blockedByMe ? (
                <button className="btn btn-secondary" onClick={handleUnblockUser}>Unblock user</button>
              ) : (
                <button className="btn btn-danger" onClick={handleBlockUser}>Block user</button>
              )}
            </div>
          </div>
          <div className="chat-box">
            <div className="chat-head">
              <div className="avatar-row">
                <Avatar name={otherName} src={conversation?.otherProfile?.avatar_url} />
                <div>
                  <div className="card-name">{otherName}</div>
                  <div className="small">
                    {conversation?.blockedByMe ? "Blocked by you" : `Auto-refreshing${lastRefreshedAt ? ` - last updated ${lastRefreshedAt}` : ""}`}
                  </div>
                </div>
              </div>
            </div>
            <div className="bubbles">
              {isLoading ? <p className="lead">Loading messages...</p> : null}
              {messages.map((message) => (
                <div className={`bubble ${message.sender_id === currentUserId ? "mine" : ""}`} key={message.id}>
                  <div className="small" style={{ marginBottom: 6 }}>
                    {message.sender_id === currentUserId ? "You" : otherName}
                  </div>
                  {message.body}
                  <div className="actions" style={{ marginTop: 8 }}>
                    <span className="tag">{new Date(message.created_at).toLocaleString()}</span>
                    {message.reported ? <span className="tag">Reported</span> : <button className="tag tag-button" onClick={() => handleReport(message.id)}>Report</button>}
                  </div>
                </div>
              ))}
              {!isLoading && messages.length === 0 ? <p className="lead">No messages yet. Say hello.</p> : null}
            </div>
            <form className="chat-input" onSubmit={handleSubmit}>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={conversation?.blockedByMe ? "Unblock this member before sending..." : "Write a message..."} disabled={conversation?.blockedByMe} required />
              <button className="btn btn-primary" type="submit" disabled={isSubmitting || conversation?.blockedByMe}>{isSubmitting ? "Sending..." : "Send"}</button>
            </form>
          </div>
          {statusMessage ? <p className="lead" style={{ marginTop: 14 }}>{statusMessage}</p> : null}
        </div>
      </RequireApproved>
    </AppShell>
  );
}
