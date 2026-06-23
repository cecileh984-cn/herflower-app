"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AppShell } from "../components/AppShell";
import { useLocalAppState } from "../components/LocalAppState";
import { ensureProfile } from "../lib/profile";
import { supabase } from "../lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useLocalAppState();
  const [email, setEmail] = useState("you@example.com");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setNeedsEmailConfirmation(false);

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    setIsSubmitting(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    try {
      await ensureProfile();
    } catch {
      setNeedsEmailConfirmation(true);
      setStatusMessage("Account created. Supabase sends a confirmation link, not a numeric code. Check your email, click the link, then log in.");
      signUp(email);
      return;
    }

    signUp(email);
    if (data.session) {
      setStatusMessage("Account created. Continue to verification.");
      router.push("/verify");
    } else {
      setNeedsEmailConfirmation(true);
      setStatusMessage("Account created. Check your email for a confirmation link, then log in.");
    }
  }

  async function resendConfirmation() {
    setStatusMessage("Sending confirmation email...");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email
    });

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setStatusMessage("Confirmation email sent again. Check inbox, spam, and promotions.");
  }

  return (
    <AppShell>
      <div className="content">
        <div className="section-head">
          <div>
            <h2>Create your account</h2>
            <p className="lead">HerFlower is for verified women aged 18 and above. Legal ID is used only for review and is never shown publicly.</p>
          </div>
          <Link className="btn btn-secondary" href="/verify">Next</Link>
        </div>
        <form className="grid two" onSubmit={handleSubmit}>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" minLength={6} required /></label>
          <label className="full">Birthday<input type="date" required /></label>
          <label className="full">Age confirmation<select><option>I confirm I am 18 years or older</option><option>I am not 18 yet</option></select></label>
          <label className="full">Terms<select required><option>I agree to the Terms of Service and Privacy Policy</option></select></label>
          <p className="small full">
            By continuing, you agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.
            HerFlower uses selfie and ID review to help protect a women-only, 18+ community.
          </p>
          <div className="actions full">
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Continue to verification"}</button>
          </div>
        </form>
        {statusMessage ? <p className="lead" style={{ marginTop: 14 }}>{statusMessage}</p> : null}
        {needsEmailConfirmation ? (
          <div className="actions" style={{ marginTop: 14 }}>
            <button className="btn btn-secondary" type="button" onClick={resendConfirmation}>Resend confirmation email</button>
            <Link className="btn btn-secondary" href="/login">Go to login</Link>
          </div>
        ) : null}
        <div className="actions" style={{ marginTop: 18 }}>
          <Link className="btn btn-secondary" href="/terms">Terms</Link>
          <Link className="btn btn-secondary" href="/privacy">Privacy</Link>
        </div>
      </div>
    </AppShell>
  );
}
