"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { Avatar } from "../../components/Avatar";
import { useLocalAppState } from "../../components/LocalAppState";
import { ensureProfile, splitList } from "../../lib/profile";
import { supabase } from "../../lib/supabase";

const avatarMaxBytes = 2 * 1024 * 1024;
const allowedAvatarTypes = ["image/jpeg", "image/png", "image/webp"];
const lookingForOptions = ["Friends", "Travel", "Language", "Local", "Support"];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { profile, status, saveProfile } = useLocalAppState();
  const [form, setForm] = useState(profile);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarObjectUrlRef = useRef("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const saved = await ensureProfile();
        if (!saved) return;
        setForm((current) => ({
          ...current,
          displayName: saved.display_name ?? current.displayName,
          ageRange: saved.age_range ?? current.ageRange,
          country: saved.country ?? current.country,
          city: saved.city ?? current.city,
          languagesSpoken: saved.languages_spoken?.join(", ") ?? current.languagesSpoken,
          languagesLearning: saved.languages_learning?.join(", ") ?? current.languagesLearning,
          interests: saved.interests?.join(", ") ?? current.interests,
          lookingFor: saved.looking_for?.join(", ") ?? current.lookingFor,
          bio: saved.bio ?? current.bio
        }));
        setAvatarUrl(saved.avatar_url ?? "");
        setAvatarPreviewUrl(saved.avatar_url ?? "");
      } catch {
        setStatusMessage("Log in first to save your profile to Supabase.");
      }
    }

    loadProfile();
  }, []);

  useEffect(() => () => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
    }
  }, []);

  function setField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleLookingFor(option: string) {
    setForm((current) => {
      const selected = splitList(current.lookingFor);
      const next = selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option];

      return {
        ...current,
        lookingFor: next.join(", ")
      };
    });
  }

  function handleAvatarChange(file: File | null) {
    setStatusMessage("");
    setAvatarFile(null);

    if (!file) {
      setAvatarPreviewUrl(avatarUrl);
      return;
    }

    if (!allowedAvatarTypes.includes(file.type)) {
      setAvatarPreviewUrl(avatarUrl);
      setStatusMessage("Please choose a JPG, PNG, or WebP image for your profile photo.");
      return;
    }

    if (file.size > avatarMaxBytes) {
      setAvatarPreviewUrl(avatarUrl);
      setStatusMessage("Profile photo must be 2MB or smaller.");
      return;
    }

    setAvatarFile(file);
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
    }
    const nextPreviewUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = nextPreviewUrl;
    setAvatarPreviewUrl(nextPreviewUrl);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (!userId) {
        setStatusMessage("Log in first to save your profile.");
        setIsSubmitting(false);
        return;
      }

      let nextAvatarUrl = avatarUrl;
      if (avatarFile) {
        setIsUploadingAvatar(true);
        setStatusMessage("Uploading avatar...");
        const extension = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const avatarPath = `${userId}/avatar-${Date.now()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-avatars")
          .upload(avatarPath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("profile-avatars")
          .getPublicUrl(avatarPath);

        nextAvatarUrl = data.publicUrl;
        setAvatarUrl(nextAvatarUrl);
        setAvatarPreviewUrl(nextAvatarUrl);
      }
      setIsUploadingAvatar(false);
      setStatusMessage("Saving profile...");

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: form.displayName,
          age_range: form.ageRange,
          country: form.country,
          city: form.city,
          languages_spoken: splitList(form.languagesSpoken),
          languages_learning: splitList(form.languagesLearning),
          interests: splitList(form.interests),
          looking_for: splitList(form.lookingFor),
          bio: form.bio,
          avatar_url: nextAvatarUrl || null
        })
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not save profile.");
      setIsSubmitting(false);
      setIsUploadingAvatar(false);
      return;
    }

    setIsSubmitting(false);
    saveProfile(form);
    router.push("/discover");
  }

  return (
    <AppShell>
      <div className="content">
        <div className="section-head">
          <div>
            <h2>Set up your profile</h2>
            <p className="lead">Tell other verified members who you are and what kind of connection you are looking for.</p>
            {status !== "approved" ? <p className="lead">Your profile can be prepared now, but member features unlock after approval.</p> : null}
          </div>
          <Link className="btn btn-secondary" href="/discover">Enter app</Link>
        </div>
        <form className="grid two" onSubmit={handleSubmit}>
          <label className="full">Profile photo
            <div className="avatar-picker">
              <Avatar name={form.displayName} src={avatarPreviewUrl} size="large" />
              <div className="grid">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleAvatarChange(event.target.files?.[0] ?? null)} />
                <span className="small">Public JPG, PNG, or WebP photo. Max 2MB. Verification selfies and ID documents stay private.</span>
              </div>
            </div>
          </label>
          <label>Display name<input value={form.displayName} onChange={(event) => setField("displayName", event.target.value)} /></label>
          <label>Age range<select value={form.ageRange} onChange={(event) => setField("ageRange", event.target.value)}><option>18-24</option><option>25-34</option><option>35-44</option><option>45+</option></select></label>
          <label>Country<input value={form.country} onChange={(event) => setField("country", event.target.value)} /></label>
          <label>City<input value={form.city} onChange={(event) => setField("city", event.target.value)} /></label>
          <label>Languages I speak<input value={form.languagesSpoken} onChange={(event) => setField("languagesSpoken", event.target.value)} /></label>
          <label>Languages I want to learn<input value={form.languagesLearning} onChange={(event) => setField("languagesLearning", event.target.value)} /></label>
          <label className="full">Interests<input value={form.interests} onChange={(event) => setField("interests", event.target.value)} placeholder="Coffee, museums, hiking..." /></label>
          <label className="full">Looking for
            <div className="choice-row">
              {lookingForOptions.map((option) => {
                const isSelected = splitList(form.lookingFor).includes(option);
                return (
                  <button
                    className={`choice-chip ${isSelected ? "active" : ""}`}
                    key={option}
                    onClick={() => toggleLookingFor(option)}
                    type="button"
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </label>
          <label className="full">Bio<textarea value={form.bio} onChange={(event) => setField("bio", event.target.value)} /></label>
          <div className="actions full">
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isUploadingAvatar ? "Uploading avatar..." : isSubmitting ? "Saving..." : "Save profile"}</button>
          </div>
        </form>
        {statusMessage ? <p className="lead" style={{ marginTop: 14 }}>{statusMessage}</p> : null}
      </div>
    </AppShell>
  );
}
