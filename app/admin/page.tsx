"use client";

import { RequireAdmin } from "../components/AccessGate";
import { AppShell } from "../components/AppShell";
import { Avatar } from "../components/Avatar";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ProfileRow } from "../lib/profile";

type VerificationRow = {
  id: string;
  user_id: string;
  selfie_path: string;
  id_document_path: string;
  status: "pending" | "approved" | "rejected" | "banned";
  rejection_reason: string | null;
  submitted_at: string;
};

type ReportRow = {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  target_type: "post" | "comment" | "message" | "user";
  target_id: string;
  reason: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  created_at: string;
  resolved_at: string | null;
  reporterProfile: ProfileRow | null;
  reportedProfile: ProfileRow | null;
};

export default function AdminPage() {
  const [verifications, setVerifications] = useState<VerificationRow[]>([]);
  const [supabaseReports, setSupabaseReports] = useState<ReportRow[]>([]);
  const [bannedProfiles, setBannedProfiles] = useState<ProfileRow[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const openReports = supabaseReports.filter((report) => report.status === "open");

  async function loadAdminData() {
    setIsLoading(true);
    setStatusMessage("");

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData.user;

    if (userError || !user) {
      setIsLoading(false);
      setAuthEmail(null);
      setStatusMessage("Log in with your Supabase admin account first, then refresh this page.");
      setVerifications([]);
      setSupabaseReports([]);
      setBannedProfiles([]);
      return;
    }

    setAuthEmail(user.email ?? null);

    const { data: verificationData, error: verificationError } = await supabase
      .from("verifications")
      .select("id,user_id,selfie_path,id_document_path,status,rejection_reason,submitted_at")
      .eq("status", "pending")
      .order("submitted_at", { ascending: false });

    if (verificationError) {
      setIsLoading(false);
      setStatusMessage(verificationError.message);
      return;
    }

    setVerifications(verificationData ?? []);

    const { data: bannedData, error: bannedError } = await supabase
      .from("profiles")
      .select("*")
      .eq("review_status", "banned")
      .order("updated_at", { ascending: false })
      .returns<ProfileRow[]>();

    if (bannedError) {
      setIsLoading(false);
      setStatusMessage(bannedError.message);
      return;
    }

    setBannedProfiles(bannedData ?? []);

    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .select("id,reporter_id,reported_user_id,target_type,target_id,reason,status,created_at,resolved_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (reportError) {
      setIsLoading(false);
      setStatusMessage(reportError.message);
      return;
    }

    const profileIds = [
      ...new Set((reportData ?? [])
        .flatMap((report) => [report.reporter_id, report.reported_user_id])
        .filter(Boolean) as string[])
    ];

    const { data: profiles, error: profilesError } = profileIds.length
      ? await supabase
        .from("profiles")
        .select("*")
        .in("id", profileIds)
        .returns<ProfileRow[]>()
      : { data: [], error: null };

    setIsLoading(false);

    if (profilesError) {
      setStatusMessage(profilesError.message);
      return;
    }

    setSupabaseReports((reportData ?? []).map((report) => ({
      ...report,
      reporterProfile: profiles?.find((profile) => profile.id === report.reporter_id) ?? null,
      reportedProfile: profiles?.find((profile) => profile.id === report.reported_user_id) ?? null
    })) as ReportRow[]);
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function approveVerification(verification: VerificationRow) {
    setStatusMessage("");

    const { error: verificationError } = await supabase
      .from("verifications")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString()
      })
      .eq("id", verification.id);

    if (verificationError) {
      setStatusMessage(verificationError.message);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ review_status: "approved" })
      .eq("id", verification.user_id);

    if (profileError) {
      setStatusMessage(profileError.message);
      return;
    }

    setStatusMessage("Verification approved.");
    loadAdminData();
  }

  async function rejectVerification(event: FormEvent<HTMLFormElement>, verification: VerificationRow) {
    event.preventDefault();
    setStatusMessage("");
    const reason = rejectionReasons[verification.id]?.trim() || "Could not verify the submitted documents.";

    const { error: verificationError } = await supabase
      .from("verifications")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", verification.id);

    if (verificationError) {
      setStatusMessage(verificationError.message);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ review_status: "rejected" })
      .eq("id", verification.user_id);

    if (profileError) {
      setStatusMessage(profileError.message);
      return;
    }

    setStatusMessage("Verification rejected.");
    loadAdminData();
  }

  async function updateReportStatus(report: ReportRow, nextStatus: "resolved" | "dismissed" | "reviewing") {
    setStatusMessage("");

    const { error } = await supabase
      .from("reports")
      .update({
        status: nextStatus,
        resolved_at: nextStatus === "resolved" || nextStatus === "dismissed" ? new Date().toISOString() : null
      })
      .eq("id", report.id);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setStatusMessage(`Report marked ${nextStatus}.`);
    loadAdminData();
  }

  async function hideReportedContent(report: ReportRow) {
    setStatusMessage("");

    if (report.target_type !== "post" && report.target_type !== "comment") {
      setStatusMessage("Only post and comment reports can be hidden from this action.");
      return;
    }

    const { error } = await supabase
      .from(report.target_type === "post" ? "posts" : "comments")
      .update({ hidden: true })
      .eq("id", report.target_id);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    await updateReportStatus(report, "resolved");
    setStatusMessage(`${report.target_type === "post" ? "Post" : "Comment"} hidden and report resolved.`);
  }

  async function banReportedUser(report: ReportRow) {
    setStatusMessage("");

    const userId = report.reported_user_id ?? (report.target_type === "user" ? report.target_id : null);
    if (!userId) {
      setStatusMessage("This report has no reported user to ban.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ review_status: "banned" })
      .eq("id", userId);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    await updateReportStatus(report, "resolved");
    setStatusMessage("User banned and report resolved.");
  }

  async function restoreBannedUser(profile: ProfileRow) {
    setStatusMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ review_status: "approved" })
      .eq("id", profile.id);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setStatusMessage(`${profile.display_name ?? "Member"} restored to approved.`);
    loadAdminData();
  }

  return (
    <AppShell>
      <RequireAdmin>
        <div className="content">
          <div className="section-head">
            <div>
              <h2>Admin review</h2>
              <p className="lead">The dashboard for manual identity applications, reports, posts, and account safety.</p>
            </div>
          </div>
          <div className="grid two">
            <div className="grid">
              <article className="card">
                <div className="card-name">Safety queue</div>
                <p className="lead">{openReports.length} open Supabase reports - {bannedProfiles.length} banned users</p>
              </article>
              <article className="card">
                <div className="card-name">MVP metrics</div>
                <p className="lead">Supabase reports: {supabaseReports.length} - Open: {openReports.length}</p>
                <button className="btn btn-secondary">View analytics</button>
              </article>
            </div>
          </div>
          <div className="grid" style={{ marginTop: 16 }}>
            <div className="section-head">
              <div>
                <h3>Pending Supabase verifications</h3>
                <p className="lead">These records come from the real verifications table.</p>
              </div>
              <button className="btn btn-secondary" onClick={loadAdminData}>Refresh</button>
            </div>
            {statusMessage ? <p className="lead">{statusMessage}</p> : null}
            {authEmail ? <p className="lead">Signed in to Supabase as {authEmail}.</p> : null}
            {isLoading ? <p className="lead">Loading pending applications...</p> : null}
            {!isLoading && verifications.length === 0 ? <p className="lead">No pending Supabase verifications.</p> : null}
            {verifications.map((verification) => (
              <article className="card grid" key={verification.id}>
                <div className="card-name">Verification request</div>
                <div className="small">User: {verification.user_id}</div>
                <div className="small">Selfie path: {verification.selfie_path}</div>
                <div className="small">Document path: {verification.id_document_path}</div>
                <div className="small">Submitted: {new Date(verification.submitted_at).toLocaleString()}</div>
                <div className="actions">
                  <button className="btn btn-primary" onClick={() => approveVerification(verification)}>Approve</button>
                </div>
                <form className="grid" onSubmit={(event) => rejectVerification(event, verification)}>
                  <label>Reject reason
                    <input
                      value={rejectionReasons[verification.id] ?? ""}
                      onChange={(event) => setRejectionReasons((current) => ({ ...current, [verification.id]: event.target.value }))}
                      placeholder="Reason shown internally"
                    />
                  </label>
                  <button className="btn btn-danger" type="submit">Reject</button>
                </form>
              </article>
            ))}
          </div>
          <div className="grid" style={{ marginTop: 16 }}>
            <div className="section-head">
              <div>
                <h3>Banned users</h3>
                <p className="lead">Restore members here if an account was banned by mistake.</p>
              </div>
            </div>
            {bannedProfiles.map((profile) => (
              <article className="card section-head" key={profile.id}>
                <div className="avatar-row">
                  <Avatar name={profile.display_name} src={profile.avatar_url} />
                  <div>
                    <div className="card-name">{profile.display_name ?? "HerFlower member"}</div>
                    <div className="small">
                      {[profile.city, profile.country].filter(Boolean).join(", ") || "Global member"}
                      {profile.languages_spoken?.length ? ` - ${profile.languages_spoken.join(", ")}` : ""}
                    </div>
                    <div className="small">User: {profile.id}</div>
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={() => restoreBannedUser(profile)}>Restore approved</button>
              </article>
            ))}
            {!isLoading && bannedProfiles.length === 0 ? <p className="lead">No banned users.</p> : null}
          </div>
          <div className="grid" style={{ marginTop: 16 }}>
            <h3>Supabase report queue</h3>
            {supabaseReports.map((report) => {
              const isHandled = report.status === "resolved" || report.status === "dismissed";

              return (
                <article className="card grid" key={report.id}>
                  <div className="section-head" style={{ marginBottom: 0 }}>
                    <div>
                      <div className="card-name">{report.target_type} report - {report.status}</div>
                      <p className="lead">{report.reason}</p>
                    </div>
                    <div className="actions">
                      {isHandled ? <span className="tag">Handled</span> : null}
                      <span className="tag">{new Date(report.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="grid two">
                    <div className="small">
                      <strong>Reporter:</strong> {report.reporterProfile?.display_name ?? report.reporter_id}
                    </div>
                    <div className="small">
                      <strong>Reported user:</strong> {report.reportedProfile?.display_name ?? report.reported_user_id ?? "Not attached"}
                    </div>
                  </div>
                  <div className="actions">
                    <span className="tag">Target: {report.target_id}</span>
                    {!isHandled && (report.target_type === "post" || report.target_type === "comment") ? (
                      <button className="btn btn-danger" onClick={() => hideReportedContent(report)}>
                        Hide {report.target_type}
                      </button>
                    ) : null}
                    {!isHandled && (report.reported_user_id || report.target_type === "user") ? (
                      <button className="btn btn-danger" onClick={() => banReportedUser(report)}>Ban user</button>
                    ) : null}
                    {!isHandled && report.status === "open" ? (
                      <button className="btn btn-secondary" onClick={() => updateReportStatus(report, "reviewing")}>Mark reviewing</button>
                    ) : null}
                    {!isHandled ? (
                      <>
                        <button className="btn btn-secondary" onClick={() => updateReportStatus(report, "resolved")}>Mark resolved</button>
                        <button className="btn btn-secondary" onClick={() => updateReportStatus(report, "dismissed")}>Dismiss</button>
                      </>
                    ) : null}
                  </div>
                </article>
              );
            })}
            {supabaseReports.length === 0 ? <p className="lead">No Supabase reports yet. Report a post, comment, user, or message to see it appear here.</p> : null}
          </div>
        </div>
      </RequireAdmin>
    </AppShell>
  );
}
