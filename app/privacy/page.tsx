"use client";

import Link from "next/link";
import { AppShell } from "../components/AppShell";

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="content legal-page">
        <div className="section-head">
          <div>
            <h2>Privacy Policy</h2>
            <p className="lead">Last updated: June 23, 2026</p>
          </div>
          <Link className="btn btn-secondary" href="/signup">Create account</Link>
        </div>

        <section className="card legal-card">
          <h3>1. Information we collect</h3>
          <p>HerFlower may collect your email address, password authentication data, birthday confirmation, profile details, profile photo, posts, comments, messages, reports, block actions, selfie verification photo, and ID document.</p>

          <h3>2. Verification data</h3>
          <p>Selfies and ID documents are used only for manual review, age checks, identity checks, and community safety. They are stored privately and are not shown on your public profile.</p>

          <h3>3. Public profile data</h3>
          <p>Your display name, city, country, languages, interests, looking-for tags, bio, and profile photo may be visible to other verified members. Do not add information you do not want other members to see.</p>

          <h3>4. Messages and community content</h3>
          <p>Posts, comments, and private messages are stored so the app can work. Reported content may be reviewed by admins for safety and moderation.</p>

          <h3>5. Storage and service providers</h3>
          <p>HerFlower currently uses Supabase for authentication, database records, and file storage, and Vercel for website hosting. These providers process data needed to operate the app.</p>

          <h3>6. Safety actions</h3>
          <p>We may use reports, blocks, verification status, and moderation history to protect members, investigate abuse, restrict unsafe accounts, and improve community safety.</p>

          <h3>7. Deleting data</h3>
          <p>You may request deletion of your account and related data. Some records may be retained when required for safety, fraud prevention, dispute handling, or legal obligations.</p>

          <h3>8. Early-stage policy</h3>
          <p>This privacy policy is written for the HerFlower MVP and should be reviewed by a qualified lawyer before significant public marketing, paid acquisition, or app-store launch.</p>
        </section>
      </div>
    </AppShell>
  );
}
