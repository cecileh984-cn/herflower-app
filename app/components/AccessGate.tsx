"use client";

import Link from "next/link";
import { useLocalAppState } from "./LocalAppState";
import { useSupabaseProfile } from "./useSupabaseProfile";

export function RequireApproved({ children }: { children: React.ReactNode }) {
  const { status } = useLocalAppState();
  const { profile, isLoading, error, refresh } = useSupabaseProfile();
  const realStatus = profile?.review_status;

  if (realStatus === "approved" || (!profile && !isLoading && !error && status === "approved")) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="content">
        <div className="status-card">
          <div>
            <h2>Checking verification</h2>
            <p className="lead">Loading your Supabase review status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (realStatus === "banned") {
    return (
      <div className="content">
        <div className="status-card">
          <div>
            <h2>Account banned</h2>
            <p className="lead">
              Your account has been banned for safety reasons. You cannot discover members, post, comment, or chat.
            </p>
            <p className="lead">Current Supabase status: banned</p>
            <div className="actions" style={{ justifyContent: "center", marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={refresh}>Refresh status</button>
              <Link className="btn btn-secondary" href="/profile">View profile</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="status-card">
        <div>
          <h2>{realStatus === "pending" ? "Under review" : realStatus === "rejected" ? "Verification rejected" : "Verification required"}</h2>
          <p className="lead">
            {error
              ? "Log in first so HerFlower can read your Supabase review status."
              : "In HerFlower, members must be approved before they can discover users, post, comment, or chat."}
          </p>
          {realStatus ? <p className="lead">Current Supabase status: {realStatus}</p> : null}
          <div className="actions" style={{ justifyContent: "center", marginTop: 18 }}>
            <button className="btn btn-secondary" onClick={refresh}>Refresh status</button>
            <Link className="btn btn-secondary" href="/login">Log in</Link>
            <Link className="btn btn-primary" href="/verify">Go to verification</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { profile, isLoading, error, refresh } = useSupabaseProfile();

  if (profile?.is_admin) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="content">
        <div className="status-card">
          <div>
            <h2>Checking admin access</h2>
            <p className="lead">Loading your Supabase admin status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="status-card">
        <div>
          <h2>Admin access</h2>
          <p className="lead">{error ? "Log in with your Supabase admin account first." : "Your current Supabase profile is not marked as admin."}</p>
          <div className="actions" style={{ justifyContent: "center", marginTop: 18 }}>
            <button className="btn btn-secondary" onClick={refresh}>Refresh status</button>
            <Link className="btn btn-secondary" href="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
