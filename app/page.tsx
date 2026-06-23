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
  ["Verified community", "Members complete email confirmation and identity review before joining core spaces."],
  ["Built for safer plans", "Find friends for coffee, museums, language practice, city walks, and travel ideas."],
  ["In-app safety tools", "Report, block, and moderation flows help keep conversations more respectful."]
];

const useCases = ["Friendship", "Travel buddies", "Local plans", "Language exchange", "Emotional support", "Community posts"];

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
            A women-only space to meet verified friends around the world for everyday support, local plans, travel companionship, and language exchange.
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
                : "New members confirm email and complete verification before joining member-only spaces."}
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
              <p className="small">Verified profiles, private chats, reports, blocks, and member-first moderation.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
