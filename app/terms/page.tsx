"use client";

import Link from "next/link";
import { AppShell } from "../components/AppShell";

export default function TermsPage() {
  return (
    <AppShell>
      <div className="content legal-page">
        <div className="section-head">
          <div>
            <h2>Terms of Service</h2>
            <p className="lead">Last updated: June 23, 2026</p>
          </div>
          <Link className="btn btn-secondary" href="/signup">Create account</Link>
        </div>

        <section className="card legal-card">
          <h3>1. Who HerFlower is for</h3>
          <p>HerFlower is a women-only friendship platform for adults aged 18 and older. By creating an account, you confirm that you are at least 18 years old and that the information you provide is accurate.</p>

          <h3>2. Verification</h3>
          <p>Members may be asked to submit a selfie and government ID for manual review. Verification is used to support age, identity, and community safety checks. Submitting false, edited, stolen, or misleading documents may result in rejection or account removal.</p>

          <h3>3. Community rules</h3>
          <p>Members must treat each other with respect. Harassment, threats, hate speech, sexual solicitation, scams, impersonation, doxxing, spam, and attempts to move users into unsafe situations are not allowed.</p>

          <h3>4. Posts and messages</h3>
          <p>You are responsible for what you post, comment, and send. Do not share another person's private information, sensitive images, or identity documents. HerFlower may hide content, resolve reports, restrict access, or ban accounts when needed for safety.</p>

          <h3>5. Reports and moderation</h3>
          <p>Members can report posts, comments, messages, and users. Admins may review reports and take action, including hiding content, dismissing reports, marking reports resolved, or banning accounts.</p>

          <h3>6. Account removal</h3>
          <p>HerFlower may suspend or remove accounts that violate these terms or create safety risks for the community. Members may request account or data deletion by contacting HerFlower support.</p>

          <h3>7. MVP notice</h3>
          <p>HerFlower is currently an early MVP. Features, rules, and moderation workflows may change as the product improves. These terms are a starting policy and should be reviewed by a qualified lawyer before a large public launch.</p>
        </section>
      </div>
    </AppShell>
  );
}
