import { getCurrentUser, ProfileRow } from "./profile";
import { supabase } from "./supabase";

export type PostRow = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  tags: string[] | null;
  hidden: boolean;
  created_at: string;
};

export type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  hidden: boolean;
  created_at: string;
};

export type PostWithAuthor = PostRow & {
  authorProfile: ProfileRow | null;
};

export type PostWithCommentCount = PostWithAuthor & {
  comment_count: number;
};

export type CommentWithAuthor = CommentRow & {
  authorProfile: ProfileRow | null;
};

export async function listPosts() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .returns<PostRow[]>();

  if (error) throw error;

  const postIds = (posts ?? []).map((post) => post.id);
  if (postIds.length === 0) return [];
  const authorIds = [...new Set((posts ?? []).map((post) => post.author_id))];

  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", postIds)
    .eq("hidden", false)
    .returns<Pick<CommentRow, "post_id">[]>();

  if (commentsError) throw commentsError;

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", authorIds)
    .returns<ProfileRow[]>();

  if (profilesError) throw profilesError;

  return (posts ?? []).map((post) => ({
    ...post,
    comment_count: (comments ?? []).filter((comment) => comment.post_id === post.id).length,
    authorProfile: profiles?.find((profile) => profile.id === post.author_id) ?? null
  }));
}

export async function createPost(input: { title: string; body: string; tag: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Log in first to publish a post.");

  const { error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title: input.title,
      body: input.body,
      tags: [input.tag]
    });

  if (error) throw error;
}

export async function getPost(postId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .eq("hidden", false)
    .maybeSingle<PostRow>();

  if (error) throw error;
  if (!data) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.author_id)
    .maybeSingle<ProfileRow>();

  if (profileError) throw profileError;
  return {
    ...data,
    authorProfile: profile ?? null
  };
}

export async function listComments(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .eq("hidden", false)
    .order("created_at", { ascending: true })
    .returns<CommentRow[]>();

  if (error) throw error;
  const comments = data ?? [];
  if (comments.length === 0) return [];

  const authorIds = [...new Set(comments.map((comment) => comment.author_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", authorIds)
    .returns<ProfileRow[]>();

  if (profilesError) throw profilesError;

  return comments.map((comment) => ({
    ...comment,
    authorProfile: profiles?.find((profile) => profile.id === comment.author_id) ?? null
  }));
}

export async function createComment(postId: string, body: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Log in first to publish a comment.");

  const { error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_id: user.id,
      body
    });

  if (error) throw error;
}

export async function createReport(input: {
  targetType: "post" | "comment";
  targetId: string;
  reportedUserId?: string | null;
  reason: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Log in first to report content.");

  const { error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      reported_user_id: input.reportedUserId ?? null,
      target_type: input.targetType,
      target_id: input.targetId,
      reason: input.reason
    });

  if (error) throw error;
}
