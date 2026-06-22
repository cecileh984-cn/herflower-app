"use client";

import Link from "next/link";
import { AppShell } from "./components/AppShell";
import { useSupabaseProfile } from "./components/useSupabaseProfile";

const previewUsers = [
  ["A", "Amelia", "London - English, French", ["Travel buddy", "Coffee"]],
  ["M", "Mina", "Seoul - Korean, English", ["Language exchange", "Art"]],
  ["S", "Sofia", "Madrid - Spanish, English", ["Local activities", "Fitness"]]
];

const trustItems = [
  ["Manual review", "Selfie and ID checks before members can chat or post."],
  ["Safety controls", "Report posts, comments, messages, and users from the places where issues happen."],
  ["Admin action", "Moderators can hide unsafe content, resolve reports, ban users, and restore test accounts."]
];

const useCases = ["Friends", "Travel buddies", "Local activities", "Language exchange", "Emotional support", "Community posts"];

export default function HomePage() {
  const { profile, user, isLoading } = useSupabaseProfile();
  const isApproved = profile?.review_status === "approved";
  const isAdmin = Boolean(profile?.is_admin);
  const isBanned = profile?.review_status === "banned";

  return (
    <AppShell>
      <div className="hero">
        <div>
          <div className="eyebrow">Verified 18+ women only</div>
          <h1>HerFlower</h1>
          <p className="hero-copy">
            A women-only global friendship app for finding friends, travel companions, local plans, language partners, and kind everyday support.
          </p>
          <div className="tags hero-tags">
            {useCases.map((item) => <span className="tag" key={item}>{item}</span>)}
          </div>
          <div className="actions">
            {isBanned ? (
              <Link className="btn btn-secondary" href="/profile">View account status</Link>
            ) : isApproved ? (
              <Link className="btn btn-primary" href="/discover">Continue to Discover</Link>
            ) : user ? (
              <Link className="btn btn-primary" href="/verify">Continue verification</Link>
            ) : (
              <Link className="btn btn-primary" href="/signup">Create account</Link>
            )}
            <Link className="btn btn-secondary" href={user ? "/messages" : "/login"}>{user ? "Messages" : "Log in"}</Link>
            {isAdmin ? <Link className="btn btn-secondary" href="/admin">Admin dashboard</Link> : null}
          </div>
          <p className="small" style={{ marginTop: 18 }}>
            {isLoading
              ? "Checking your HerFlower status..."
              : user
                ? `Signed in as ${user.email}. Status: ${profile?.review_status ?? "not loaded"}.`
                : "New members must complete email confirmation and manual verification before joining the community."}
          </p>
          <div className="landing-grid">
            {trustItems.map(([title, copy]) => (
              <article className="mini-card" key={title}>
                <div className="card-name">{title}</div>
                <p className="small">{copy}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="phone-card" aria-label="Mobile preview">
          <div className="phone-screen">
            <div className="section-head">
              <h3>Discover</h3>
              <span className="tag">Verified</span>
            </div>
            <div className="grid">
              {previewUsers.map(([initial, name, location, tags]) => (
                <article className="card" key={name as string}>
                  <div className="avatar-row">
                    <div className="avatar">{initial}</div>
                    <div>
                      <div className="card-name">{name}</div>
                      <div className="small">{location}</div>
                    </div>
                  </div>
                  <div className="tags">
                    {(tags as string[]).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
                  </div>
                </article>
              ))}
            </div>
            <div className="safety-strip">
              <div className="card-name">Safety first</div>
              <p className="small">Verified profiles, private chats, report controls, blocks, and admin review.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
