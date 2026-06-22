"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AppShell } from "../components/AppShell";
import { useLocalAppState } from "../components/LocalAppState";
import { RoseLogo } from "../components/RoseLogo";
import { ensureProfile } from "../lib/profile";
import { supabase } from "../lib/supabase";

function safeStorageName(file: File, prefix: string) {
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "file";
  return `${prefix}-${Date.now()}.${extension}`;
}

export default function VerifyPage() {
  const router = useRouter();
  const { status, submitVerification } = useLocalAppState();
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setNeedsLogin(false);

    try {
      const profile = await ensureProfile();
      if (!profile) {
        setStatusMessage("Log in first to submit verification.");
        setNeedsLogin(true);
        setIsSubmitting(false);
        return;
      }

      if (!selfieFile || !documentFile) {
        setStatusMessage("Please choose both a selfie photo and an ID document.");
        setIsSubmitting(false);
        return;
      }

      const selfiePath = `${profile.id}/${safeStorageName(selfieFile, "selfie")}`;
      const documentPath = `${profile.id}/${safeStorageName(documentFile, "document")}`;

      const { error: selfieError } = await supabase.storage
        .from("verification-selfies")
        .upload(selfiePath, selfieFile, { upsert: true });

      if (selfieError) throw selfieError;

      const { error: documentError } = await supabase.storage
        .from("verification-documents")
        .upload(documentPath, documentFile, { upsert: true });

      if (documentError) throw documentError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ review_status: "pending" })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      const { error: verificationError } = await supabase
        .from("verifications")
        .insert({
          user_id: profile.id,
          selfie_path: selfiePath,
          id_document_path: documentPath,
          status: "pending"
        });

      if (verificationError) throw verificationError;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not submit verification.";
      setNeedsLogin(message.toLowerCase().includes("auth session"));
      setStatusMessage(message.toLowerCase().includes("auth session") ? "Please log in first, then submit verification again." : message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    submitVerification();
    setStatusMessage("Verification submitted. Your files were uploaded privately to Supabase Storage.");
  }

  return (
    <AppShell>
      <div className="content">
        <div className="section-head">
          <div>
            <h2>Verification</h2>
            <p className="lead">Upload a clear selfie and a government ID. An admin reviews applications manually before members can chat or post.</p>
          </div>
        </div>
        <form className="grid two" onSubmit={handleSubmit}>
          <div className="upload-box">
            <div className="card-name">Selfie photo</div>
            <div className="small">Clear face, no filters, good lighting.</div>
            <input type="file" accept="image/*" onChange={(event) => setSelfieFile(event.target.files?.[0] ?? null)} />
            {selfieFile ? <div className="small">Selected: {selfieFile.name}</div> : null}
          </div>
          <div className="upload-box">
            <div className="card-name">ID document</div>
            <div className="small">Used only to confirm age and identity. Not public.</div>
            <input type="file" accept="image/*,.pdf" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} />
            {documentFile ? <div className="small">Selected: {documentFile.name}</div> : null}
          </div>
          <div className="actions full">
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit for review"}</button>
            <button className="btn btn-secondary" type="button" onClick={() => router.push("/profile/setup")}>Skip after approval</button>
          </div>
        </form>
        {statusMessage ? <p className="lead" style={{ marginTop: 14 }}>{statusMessage}</p> : null}
        {needsLogin ? (
          <div className="actions" style={{ marginTop: 14 }}>
            <Link className="btn btn-primary" href="/login">Go to login</Link>
          </div>
        ) : null}
        <div className="status-card" style={{ marginTop: 16 }}>
          <div className="logo-mark" style={{ width: 86, height: 86, borderRadius: 28 }}>
            <RoseLogo />
          </div>
          <div>
            <h2>{status === "pending" ? "Under review" : "Ready for review"}</h2>
            <p className="lead">
              {status === "pending"
                ? "Your application is pending. We will review your selfie and ID before unlocking member features."
                : "Submit the form above to send your verification for manual review."}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
