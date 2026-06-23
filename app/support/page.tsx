"use client";

import Link from "next/link";
import { AppShell } from "../components/AppShell";

export default function SupportPage() {
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
