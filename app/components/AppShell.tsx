"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useLocalAppState } from "./LocalAppState";
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
  const { status, isAdmin, email, resetDemo, toggleAdmin } = useLocalAppState();
  const { profile, user, refresh } = useSupabaseProfile();
  const isApproved = profile?.review_status === "approved";
  const canUseApp = isApproved || isAdmin || profile?.is_admin;
  const navItems: NavItem[] = user
    ? [
      { href: "/", label: "Home", icon: "H" },
      { href: "/discover", label: "Discover", icon: "D" },
      { href: "/community", label: "Community", icon: "C" },
      { href: "/messages", label: "Messages", icon: "M" },
      { href: "/profile", label: "Profile", icon: "P" },
      { href: canUseApp ? "/profile/setup" : "/verify", label: canUseApp ? "Edit profile" : "Verification", icon: "V" },
      ...(profile?.is_admin || isAdmin ? [{ href: "/admin", label: "Admin", icon: "A" }] : [])
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
            <strong>Supabase:</strong> {profile?.review_status ?? "not loaded"}
            {profile?.review_status === "banned" ? " - access blocked" : ""}
            <br />
            <strong>Admin:</strong> {isAdmin ? "on" : "off"}
            {profile?.is_admin ? " / Supabase admin" : ""}
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
            {email ? (
              <>
                <br />
                <strong>Demo email:</strong> {email}
              </>
            ) : null}
            <br />
            <strong>Demo status:</strong> {status}
            <div className="sidebar-actions">
              <button className="mini-btn" onClick={toggleAdmin}>{isAdmin ? "Exit admin" : "Admin demo"}</button>
              {user ? <button className="mini-btn" onClick={logOut}>Log out</button> : null}
              <button className="mini-btn" onClick={resetDemo}>Reset</button>
            </div>
          </div>
        </aside>
        <section className="panel">{children}</section>
      </section>
    </main>
  );
}
