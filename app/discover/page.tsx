"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireApproved } from "../components/AccessGate";
import { AppShell } from "../components/AppShell";
import { Avatar } from "../components/Avatar";
import { getOrCreateConversation, listDiscoverProfiles } from "../lib/chat";
import { ProfileRow } from "../lib/profile";

const discoverFilters = ["All", "Travel", "Language", "Local", "Support", "Friends"];

function profileMatchesFilter(profile: ProfileRow, filter: string) {
  if (filter === "All") return true;

  const searchable = [
    ...(profile.looking_for ?? []),
    ...(profile.interests ?? []),
    ...(profile.languages_spoken ?? []),
    ...(profile.languages_learning ?? []),
    profile.bio,
    profile.city,
    profile.country
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const aliases: Record<string, string[]> = {
    Travel: ["travel", "trip", "buddy"],
    Language: ["language", "english", "spanish", "mandarin", "korean", "french", "exchange"],
    Local: ["local", "city", "activity", "activities", "coffee"],
    Support: ["support", "emotional", "kind", "listen"],
    Friends: ["friend", "friends", "friendship"]
  };

  return (aliases[filter] ?? [filter.toLowerCase()]).some((keyword) => searchable.includes(keyword));
}

export default function DiscoverPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const visibleProfiles = profiles.filter((profile) => profileMatchesFilter(profile, activeFilter));

  async function refreshProfiles() {
    setIsLoading(true);
    setStatusMessage("");

    try {
      setProfiles(await listDiscoverProfiles());
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not load profiles.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshProfiles();
  }, []);

  async function startConversation(profile: ProfileRow) {
    setStatusMessage("");

    try {
      const conversation = await getOrCreateConversation(profile.id);
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not start conversation.");
    }
  }

  return (
    <AppShell>
      <RequireApproved>
        <div className="content">
          <div className="section-head">
            <div>
              <h2>Discover</h2>
              <p className="lead">Browse verified women by location, language, interests, and what they are looking for.</p>
            </div>
            <Link className="btn btn-primary" href="/messages">Messages</Link>
          </div>
          <div className="filters">
            {discoverFilters.map((filter) => (
              <button
                className={`filter tag-button ${activeFilter === filter ? "active" : ""}`}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
          {statusMessage ? <p className="lead">{statusMessage}</p> : null}
          <div className="grid three">
            {isLoading ? <p className="lead">Loading approved profiles...</p> : null}
            {!isLoading && profiles.length === 0 ? (
              <p className="lead">No other approved profiles yet. Register and approve a second test account to try real two-user chat.</p>
            ) : null}
            {!isLoading && profiles.length > 0 && visibleProfiles.length === 0 ? (
              <p className="lead">No members match {activeFilter} yet. Try All or update your profile interests.</p>
            ) : null}
            {visibleProfiles.map((profile) => {
              const name = profile.display_name || "HerFlower member";
              const tags = [...(profile.looking_for ?? []), ...(profile.interests ?? [])].slice(0, 3);
              return (
                <article className="card grid" key={profile.id}>
                  <div className="card-top">
                    <Avatar name={name} src={profile.avatar_url} />
                    <div>
                      <div className="card-name">{name}</div>
                      <div className="small">{[profile.city, profile.country].filter(Boolean).join(", ") || "Global member"}</div>
                    </div>
                  </div>
                  <div className="small">{profile.bio || "Approved HerFlower member."}</div>
                  <div className="tags">{tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
                  <button className="btn btn-primary" onClick={() => startConversation(profile)}>Message</button>
                </article>
              );
            })}
          </div>
        </div>
      </RequireApproved>
    </AppShell>
  );
}
