import { supabase } from "./supabase";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  age_range: string | null;
  country: string | null;
  city: string | null;
  languages_spoken: string[] | null;
  languages_learning: string[] | null;
  interests: string[] | null;
  looking_for: string[] | null;
  bio: string | null;
  avatar_url: string | null;
  review_status: "pending" | "approved" | "rejected" | "banned";
  is_admin: boolean;
};

export function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function ensureProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (selectError) throw selectError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      display_name: user.email?.split("@")[0] ?? "HerFlower member",
      review_status: "pending"
    })
    .select("*")
    .single<ProfileRow>();

  if (error) throw error;
  return data;
}
