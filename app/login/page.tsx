"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AppShell } from "../components/AppShell";
import { useLocalAppState } from "../components/LocalAppState";
import { ensureProfile } from "../lib/profile";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { signUp } = useLocalAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setIsSubmitting(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    await ensureProfile();
    signUp(email);
    router.push("/verify");
  }

  return (
    <AppShell>
      <div className="content">
        <div className="section-head">
          <div>
            <h2>Log in</h2>
            <p className="lead">Use your HerFlower email and password to continue your verification flow.</p>
          </div>
          <Link className="btn btn-secondary" href="/signup">Create account</Link>
        </div>
        <form className="grid two" onSubmit={handleSubmit}>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" /></label>
          <div className="actions full">
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Log in"}</button>
          </div>
        </form>
        {statusMessage ? <p className="lead" style={{ marginTop: 14 }}>{statusMessage}</p> : null}
      </div>
    </AppShell>
  );
}
