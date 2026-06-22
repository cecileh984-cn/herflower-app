"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireApproved } from "../components/AccessGate";
import { AppShell } from "../components/AppShell";
import { Avatar } from "../components/Avatar";
import { ConversationPreview, listConversations } from "../lib/chat";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function refreshConversations() {
    setIsLoading(true);
    setStatusMessage("");

    try {
      setConversations(await listConversations());
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not load messages.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshConversations();
  }, []);

  return (
    <AppShell>
      <RequireApproved>
        <div className="content">
          <div className="section-head">
            <div>
              <h2>Messages</h2>
              <p className="lead">Only verified members can send messages. New accounts have daily limits to reduce spam.</p>
            </div>
            <button className="btn btn-secondary" onClick={refreshConversations}>Refresh</button>
          </div>
          {statusMessage ? <p className="lead">{statusMessage}</p> : null}
          <div className="grid">
            {isLoading ? <p className="lead">Loading conversations...</p> : null}
            {!isLoading && conversations.length === 0 ? (
              <p className="lead">No conversations yet. Go to Discover and message another approved member.</p>
            ) : null}
            {conversations.map((conversation) => {
              const name = conversation.otherProfile?.display_name || "HerFlower member";
              const lastMessage = conversation.lastMessage;
              const lastMessageFromMe = lastMessage?.sender_id === conversation.currentUserId;
              const preview = lastMessage
                ? `${lastMessageFromMe ? "You" : name}: ${lastMessage.body}`
                : "No messages yet.";
              return (
                <Link className="card section-head" href={`/chat/${conversation.id}`} key={conversation.id}>
                  <div className="avatar-row">
                    <Avatar name={name} src={conversation.otherProfile?.avatar_url} />
                    <div>
                      <div className="card-name">{name}</div>
                      <div className="small">{preview}</div>
                    </div>
                  </div>
                  <div className="actions">
                    {lastMessage && !lastMessageFromMe ? <span className="tag">New</span> : null}
                    <span className="tag">{conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleString() : "New"}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </RequireApproved>
    </AppShell>
  );
}
