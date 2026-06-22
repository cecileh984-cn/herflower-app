"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { ensureProfile, ProfileRow } from "../lib/profile";
import { supabase } from "../lib/supabase";

export function useSupabaseProfile() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setIsLoading(true);
    setError("");

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      setUser(userData.user);
      const nextProfile = await ensureProfile();
      setProfile(nextProfile);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load profile.");
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return {
    profile,
    user,
    isLoading,
    error,
    refresh
  };
}
