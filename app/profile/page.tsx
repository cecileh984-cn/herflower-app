"use client";

import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { Avatar } from "../components/Avatar";
import { useLocalAppState } from "../components/LocalAppState";
import { useSupabaseProfile } from "../components/useSupabaseProfile";

export default function ProfilePage() {
  const { profile, status, profileComplete } = useLocalAppState();
  const { profile: supabaseProfile, isLoading } = useSupabaseProfile();
  const displayName = supabaseProfile?.display_name ?? profile.displayName;
  const city = supabaseProfile?.city ?? profile.city;
  const country = supabaseProfile?.country ?? profile.country;
  const languagesSpoken = supabaseProfile?.languages_spoken?.join(", ") ?? profile.languagesSpoken;
  const bio = supabaseProfile?.bio ?? profile.bio;
  const tags = [
    ...(supabaseProfile?.looking_for ?? profile.lookingFor.split(",")),
    ...(supabaseProfile?.interests ?? profile.interests.split(","))
  ];
  const reviewStatus = supabaseProfile?.review_status ?? status;
  const verificationLabel = isLoading
    ? "Checking verification..."
    : reviewStatus === "approved"
      ? "Verified 18+"
      : reviewStatus === "pending"
        ? "Under review"
        : reviewStatus === "rejected"
          ? "Verification rejected"
          : "Not approved yet";

  return (
    <AppShell>
      <div className="content">
        <div className="section-head">
          <div>
            <h2>Profile</h2>
            <p className="lead">Your public profile shows only what you choose to share. ID documents are never public.</p>
          </div>
          <Link className="btn btn-secondary" href="/profile/setup">Edit profile</Link>
        </div>
        <article className="card">
          <div className="avatar-row">
            <Avatar name={displayName} src={supabaseProfile?.avatar_url} size="large" />
            <div>
              <div className="card-name" style={{ fontSize: 24 }}>{displayName}</div>
              <div className="small">{city}, {country} - {languagesSpoken} - {verificationLabel}</div>
            </div>
          </div>
          <p className="lead" style={{ marginTop: 18 }}>{bio}</p>
          <div className="tags">
            {tags
              .map((tag) => tag.trim())
              .filter(Boolean)
              .map((tag) => <span className="tag" key={tag}>{tag}</span>)}
          </div>
          {!profileComplete ? <p className="lead" style={{ marginTop: 18 }}>Demo note: this is still the default profile. Fill Profile Setup to personalize it.</p> : null}
        </article>
      </div>
    </AppShell>
  );
}
