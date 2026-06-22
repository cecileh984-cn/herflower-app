"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ReviewStatus = "guest" | "signed_up" | "pending" | "approved" | "rejected" | "banned";

export type DemoProfile = {
  displayName: string;
  ageRange: string;
  country: string;
  city: string;
  languagesSpoken: string;
  languagesLearning: string;
  interests: string;
  lookingFor: string;
  bio: string;
};

export type DemoPost = {
  id: string;
  title: string;
  body: string;
  tag: string;
  createdAt: string;
};

export type DemoComment = {
  id: string;
  postId: string;
  body: string;
  createdAt: string;
};

export type DemoReport = {
  id: string;
  targetType: "post" | "comment" | "message" | "user";
  targetId: string;
  reason: string;
  status: "open" | "resolved";
  createdAt: string;
};

type DemoState = {
  status: ReviewStatus;
  isAdmin: boolean;
  email: string;
  profileComplete: boolean;
  profile: DemoProfile;
  posts: DemoPost[];
  comments: DemoComment[];
  reports: DemoReport[];
  messages: string[];
  blockedChat: boolean;
};

type DemoActions = {
  signUp: (email: string) => void;
  submitVerification: () => void;
  approveUser: () => void;
  rejectUser: () => void;
  toggleAdmin: () => void;
  saveProfile: (profile: DemoProfile) => void;
  addPost: (post: Omit<DemoPost, "id" | "createdAt">) => void;
  addComment: (postId: string, body: string) => void;
  addReport: (report: Omit<DemoReport, "id" | "status" | "createdAt">) => void;
  resolveReport: (reportId: string) => void;
  addMessage: (message: string) => void;
  blockChat: () => void;
  unblockChat: () => void;
  resetDemo: () => void;
};

const defaultProfile: DemoProfile = {
  displayName: "Luna",
  ageRange: "25-34",
  country: "United States",
  city: "New York",
  languagesSpoken: "English, Mandarin",
  languagesLearning: "Spanish",
  interests: "Coffee, museums, walking, language practice",
  lookingFor: "Friends, travel buddy, language exchange",
  bio: "I am new in the city and would love to meet kind women for coffee, walks, and language practice."
};

const initialState: DemoState = {
  status: "guest",
  isAdmin: false,
  email: "",
  profileComplete: false,
  profile: defaultProfile,
  posts: [
    {
      id: "demo-1",
      title: "Looking for friends in Toronto",
      body: "I moved here recently and would love to meet women for coffee, bookstores, and weekend walks.",
      tag: "Friends",
      createdAt: "Demo"
    },
    {
      id: "demo-2",
      title: "Solo trip to Japan next month",
      body: "Anyone traveling around Tokyo or Kyoto in July? I would love a verified female travel buddy for a few days.",
      tag: "Travel",
      createdAt: "Demo"
    }
  ],
  comments: [
    {
      id: "comment-1",
      postId: "demo-1",
      body: "Welcome to Toronto. I would love to join a bookstore walk.",
      createdAt: "Demo"
    },
    {
      id: "comment-2",
      postId: "demo-2",
      body: "I may be in Kyoto around that time. This sounds lovely.",
      createdAt: "Demo"
    }
  ],
  reports: [],
  messages: [
    "Hi! I saw your post about finding museum friends.",
    "Yes, I would love that. Are you free this weekend?",
    "Saturday afternoon works for me."
  ],
  blockedChat: false
};

const storageKey = "herflower-demo-state";

const LocalAppContext = createContext<(DemoState & DemoActions) | null>(null);

export function LocalAppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<DemoState>;
      setState({
        ...initialState,
        ...parsed,
        profile: { ...initialState.profile, ...parsed.profile },
        posts: parsed.posts ?? initialState.posts,
        comments: parsed.comments ?? initialState.comments,
        reports: parsed.reports ?? initialState.reports,
        messages: parsed.messages ?? initialState.messages,
        blockedChat: parsed.blockedChat ?? initialState.blockedChat
      });
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [loaded, state]);

  const value = useMemo<DemoState & DemoActions>(() => ({
    ...state,
    signUp: (email) => setState((current) => ({ ...current, email, status: "signed_up" })),
    submitVerification: () => setState((current) => ({ ...current, status: "pending" })),
    approveUser: () => setState((current) => ({ ...current, status: "approved" })),
    rejectUser: () => setState((current) => ({ ...current, status: "rejected" })),
    toggleAdmin: () => setState((current) => ({ ...current, isAdmin: !current.isAdmin })),
    saveProfile: (profile) => setState((current) => ({
      ...current,
      profile,
      profileComplete: true,
      status: current.status === "guest" ? "approved" : current.status
    })),
    addPost: (post) => setState((current) => ({
      ...current,
      posts: [
        {
          ...post,
          id: crypto.randomUUID(),
          createdAt: "Just now"
        },
        ...current.posts
      ]
    })),
    addComment: (postId, body) => setState((current) => ({
      ...current,
      comments: [
        ...current.comments,
        {
          id: crypto.randomUUID(),
          postId,
          body,
          createdAt: "Just now"
        }
      ]
    })),
    addReport: (report) => setState((current) => ({
      ...current,
      reports: [
        {
          ...report,
          id: crypto.randomUUID(),
          status: "open",
          createdAt: "Just now"
        },
        ...current.reports
      ]
    })),
    resolveReport: (reportId) => setState((current) => ({
      ...current,
      reports: current.reports.map((report) => report.id === reportId ? { ...report, status: "resolved" } : report)
    })),
    addMessage: (message) => setState((current) => current.blockedChat ? current : ({ ...current, messages: [...current.messages, message] })),
    blockChat: () => setState((current) => ({ ...current, blockedChat: true })),
    unblockChat: () => setState((current) => ({ ...current, blockedChat: false })),
    resetDemo: () => {
      window.localStorage.removeItem(storageKey);
      setState(initialState);
    }
  }), [state]);

  return (
    <LocalAppContext.Provider value={value}>
      {children}
    </LocalAppContext.Provider>
  );
}

export function useLocalAppState() {
  const context = useContext(LocalAppContext);
  if (!context) {
    throw new Error("useLocalAppState must be used inside LocalAppStateProvider");
  }
  return context;
}
