"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Avatar } from "../components/Avatar";
import { useLocalAppState } from "../components/LocalAppState";
import { useSupabaseProfile } from "../components/useSupabaseProfile";
import { supabase } from "../lib/supabase";

export default function ProfilePage() {
  const { profile, status, profileComplete } = useLocalAppState();
  const { profile: supabaseProfile, user, isLoading } = useSupabaseProfile();
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteStatusMessage, setDeleteStatusMessage] = useState("");
  const [isSubmittingDeletion, setIsSubmittingDeletion] = useState(false);
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
          {!profileComplete ? <p className="lead" style={{ marginTop: 18 }}>Complete your profile so other verified members can understand what kind of connection you are looking for.</p> : null}
        </article>
        <article className="card grid" style={{ marginTop: 16 }}>
          <div>
            <div className="card-name">Account and data deletion</div>
            <p className="lead">
              You can request deletion of your account and related data. HerFlower will review the request before taking action so accounts are not removed by mistake.
            </p>
          </div>
          <form className="grid" onSubmit={async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setDeleteStatusMessage("");

            if (!user) {
              setDeleteStatusMessage("Log in first to request account deletion.");
              return;
            }

            setIsSubmittingDeletion(true);

            const { data: existingRequest, error: existingError } = await supabase
              .from("deletion_requests")
              .select("id,status")
              .eq("user_id", user.id)
              .in("status", ["open", "reviewing"])
              .limit(1)
              .maybeSingle();

            if (existingError) {
              setDeleteStatusMessage(existingError.message);
              setIsSubmittingDeletion(false);
              return;
            }

            if (existingRequest) {
              setDeleteStatusMessage("You already have an account deletion request under review.");
              setIsSubmittingDeletion(false);
              return;
            }

            const { error } = await supabase
              .from("deletion_requests")
              .insert({
                user_id: user.id,
                reason: deleteReason.trim() || null,
                status: "open"
              });

            setIsSubmittingDeletion(false);

            if (error) {
              setDeleteStatusMessage(error.message);
              return;
            }

            setDeleteReason("");
            setDeleteStatusMessage("Deletion request submitted. An admin will review it.");
          }}>
            <label>Reason, optional<textarea value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} placeholder="Tell us anything we should know before reviewing your deletion request." /></label>
            <div className="actions">
              <button className="btn btn-danger" type="submit" disabled={isSubmittingDeletion}>
                {isSubmittingDeletion ? "Submitting..." : "Request account deletion"}
              </button>
              <Link className="btn btn-secondary" href="/privacy">Read Privacy Policy</Link>
            </div>
          </form>
          {deleteStatusMessage ? <p className="lead">{deleteStatusMessage}</p> : null}
        </article>
      </div>
    </AppShell>
  );
}
