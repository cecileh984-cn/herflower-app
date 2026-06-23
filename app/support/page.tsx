"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AppShell } from "../components/AppShell";
import { supabase } from "../lib/supabase";

export default function SupportPage() {
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 8) {
      setStatusMessage("Please write a little more so we can understand the issue.");
      return;
    }

    setIsSubmitting(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData.user;

    if (userError || !user) {
      setIsSubmitting(false);
      setStatusMessage("Please log in before sending feedback.");
      return;
    }

    const { error } = await supabase
      .from("beta_feedback")
      .insert({
        user_id: user.id,
        category,
        message: trimmedMessage
      });

    setIsSubmitting(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setMessage("");
    setCategory("general");
    setStatusMessage("Thank you. Your feedback was sent to the HerFlower admin queue.");
  }

  return (
    <AppShell>
      <div className="content legal-page">
        <div className="section-head">
          <div>
            <h2>Support</h2>
            <p className="lead">Get help with verification, account safety, reports, and data requests.</p>
          </div>
          <Link className="btn btn-secondary" href="/profile">Go to profile</Link>
        </div>

        <section className="grid">
          <article className="card legal-card">
            <h3>Send beta feedback</h3>
            <p>Use this for bugs, confusing screens, safety concerns, or ideas from early testers.</p>
            <form className="grid" onSubmit={submitFeedback}>
              <label>Category
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="general">General feedback</option>
                  <option value="bug">Bug or broken screen</option>
                  <option value="safety">Safety concern</option>
                  <option value="verification">Verification help</option>
                  <option value="idea">Feature idea</option>
                </select>
              </label>
              <label>Message
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us what happened, what you expected, or what would make HerFlower better."
                />
              </label>
              <button className="btn btn-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Sending..." : "Send feedback"}
              </button>
            </form>
            {statusMessage ? <p className="lead">{statusMessage}</p> : null}
          </article>

          <article className="card legal-card">
            <h3>Contact</h3>
            <p>Email: <a href="mailto:support@herflower.app">support@herflower.app</a></p>
            <p>This is the planned HerFlower support address. Until a custom email inbox is connected, urgent MVP support can be handled by the founder manually.</p>
          </article>

          <article className="card legal-card">
            <h3>Verification help</h3>
            <p>If your verification is pending, rejected, or you uploaded the wrong file, contact support with the email address used for your HerFlower account. Do not send ID documents by email unless HerFlower specifically asks you to.</p>
          </article>

          <article className="card legal-card">
            <h3>Safety and reports</h3>
            <p>If another member makes you feel unsafe, use the in-app report and block tools first. For urgent safety concerns, contact support and include the member name, conversation context, and approximate time.</p>
          </article>

          <article className="card legal-card">
            <h3>Account and data deletion</h3>
            <p>You can submit an account deletion request from your Profile page. HerFlower reviews deletion requests before taking action so accounts are not removed by mistake.</p>
            <div className="actions">
              <Link className="btn btn-secondary" href="/profile">Request deletion from Profile</Link>
              <Link className="btn btn-secondary" href="/privacy">Read Privacy Policy</Link>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
