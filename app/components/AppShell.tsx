"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { RoseLogo } from "./RoseLogo";
import { useSupabaseProfile } from "./useSupabaseProfile";
import { supabase } from "../lib/supabase";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user, refresh } = useSupabaseProfile();
  const isApproved = profile?.review_status === "approved";
  const canUseApp = isApproved || profile?.is_admin;
  const navItems: NavItem[] = user
    ? [
      { href: "/", label: "Home", icon: "H" },
      { href: "/discover", label: "Discover", icon: "D" },
      { href: "/community", label: "Community", icon: "C" },
      { href: "/messages", label: "Messages", icon: "M" },
      { href: "/profile", label: "Profile", icon: "P" },
      { href: canUseApp ? "/profile/setup" : "/verify", label: canUseApp ? "Edit profile" : "Verification", icon: "V" },
      ...(profile?.is_admin ? [{ href: "/admin", label: "Admin", icon: "A" }] : [])
    ]
    : [
      { href: "/", label: "Home", icon: "H" },
      { href: "/signup", label: "Create account", icon: "+" },
      { href: "/login", label: "Log in", icon: "L" }
    ];

  async function logOut() {
    await supabase.auth.signOut();
    await refresh();
    router.push("/login");
  }

  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="logo-mark">
            <RoseLogo />
          </span>
          HerFlower
        </Link>
        <div className="top-actions">
          <span className="pill">Women-only</span>
          <span className="pill">Verified 18+</span>
          <span className="pill">Global friendship</span>
        </div>
      </header>
      <section className="app-frame">
        <aside className="sidebar">
          <nav className="nav" aria-label="HerFlower navigation">
            {navItems.map(({ href, label, icon }) => (
              <Link className={`nav-link ${pathname === href ? "active" : ""}`} href={href} key={href}>
                <span className="nav-icon">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-note">
            <strong>Verification:</strong> {profile?.review_status ?? "not signed in"}
            {profile?.review_status === "banned" ? " - access blocked" : ""}
            {user?.email ? (
              <>
                <br />
                <strong>Logged in:</strong> {user.email}
              </>
            ) : (
              <>
                <br />
                <strong>Logged in:</strong> no
              </>
            )}
            {profile?.is_admin ? (
              <>
                <br />
                <strong>Role:</strong> Admin
              </>
            ) : null}
            <div className="sidebar-actions">
              {user ? <button className="mini-btn" onClick={logOut}>Log out</button> : null}
              <Link className="mini-btn" href="/terms">Terms</Link>
              <Link className="mini-btn" href="/privacy">Privacy</Link>
              <Link className="mini-btn" href="/support">Support</Link>
            </div>
          </div>
        </aside>
        <section className="panel">{children}</section>
      </section>
    </main>
  );
}
