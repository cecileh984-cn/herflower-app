"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { RequireApproved } from "../../components/AccessGate";
import { AppShell } from "../../components/AppShell";
import { Avatar } from "../../components/Avatar";
import { CommentWithAuthor, createComment, createReport, getPost, listComments, PostWithAuthor } from "../../lib/community";

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [body, setBody] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refreshPost(options: { silent?: boolean } = {}) {
    if (!options.silent) {
      setIsLoading(true);
      setStatusMessage("");
    }

    try {
      const nextPost = await getPost(params.id);
      setPost(nextPost);
      setComments(nextPost ? await listComments(params.id) : []);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    } catch (error) {
      if (!options.silent) {
        setStatusMessage(error instanceof Error ? error.message : "Could not load post.");
      }
    } finally {
      if (!options.silent) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    refreshPost();
    const interval = window.setInterval(() => {
      refreshPost({ silent: true });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [params.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await createComment(params.id, body);
      setBody("");
      await refreshPost();
      setStatusMessage("Comment published to Supabase.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not publish comment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reportPost() {
    if (!post) return;
    try {
      await createReport({
        targetType: "post",
        targetId: post.id,
        reportedUserId: post.author_id,
        reason: "Post feels unsafe or inappropriate"
      });
      setStatusMessage("Post report submitted.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not report post.");
    }
  }

  async function reportComment(comment: CommentWithAuthor) {
    try {
      await createReport({
        targetType: "comment",
        targetId: comment.id,
        reportedUserId: comment.author_id,
        reason: "Comment reported by a member"
      });
      setStatusMessage("Comment report submitted.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not report comment.");
    }
  }

  if (!isLoading && !post) {
    return (
      <AppShell>
        <RequireApproved>
          <div className="content">
            <div className="status-card">
              <div>
                <h2>Post not found</h2>
                <p className="lead">{statusMessage || "This post may have been hidden or deleted."}</p>
                <Link className="btn btn-primary" href="/community">Back to Community</Link>
              </div>
            </div>
          </div>
        </RequireApproved>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <RequireApproved>
        <div className="content">
          <div className="section-head">
            <div>
              <h2>{post?.title ?? "Loading post..."}</h2>
              <p className="lead">
                {post
                  ? `${post.tags?.[0] ?? "General"} - ${post.authorProfile?.display_name ?? "HerFlower member"} - ${new Date(post.created_at).toLocaleString()}`
                  : "Loading from Supabase..."}
              </p>
            </div>
            <div className="actions">
              <span className="tag">{lastRefreshedAt ? `Updated ${lastRefreshedAt}` : "Auto-refreshing"}</span>
              <button className="btn btn-secondary" onClick={() => refreshPost()}>Refresh</button>
              <Link className="btn btn-secondary" href="/community">Back</Link>
            </div>
          </div>

          {post ? (
            <article className="card" style={{ marginBottom: 16 }}>
              <div className="avatar-row" style={{ marginBottom: 14 }}>
                <Avatar name={post.authorProfile?.display_name} src={post.authorProfile?.avatar_url} />
                <div>
                  <div className="card-name">{post.authorProfile?.display_name ?? "HerFlower member"}</div>
                  <div className="small">
                    {[post.authorProfile?.city, post.authorProfile?.country].filter(Boolean).join(", ") || "Global member"}
                    {post.authorProfile?.languages_spoken?.length ? ` - ${post.authorProfile.languages_spoken.join(", ")}` : ""}
                  </div>
                </div>
              </div>
              <p className="lead">{post.body}</p>
              <div className="actions">
                <button className="btn btn-secondary" onClick={reportPost}>Report post</button>
              </div>
            </article>
          ) : null}

          <form className="card grid" onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
            <label>Write a comment<textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add a kind, helpful comment..." required /></label>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting || !post}>{isSubmitting ? "Publishing..." : "Publish comment"}</button>
          </form>
          {statusMessage ? <p className="lead">{statusMessage}</p> : null}

          <div className="grid">
            {isLoading ? <p className="lead">Loading comments...</p> : null}
            {comments.map((comment) => (
              <article className="card" key={comment.id}>
                <div className="avatar-row" style={{ marginBottom: 12 }}>
                  <Avatar name={comment.authorProfile?.display_name} src={comment.authorProfile?.avatar_url} />
                  <div>
                    <div className="card-name">{comment.authorProfile?.display_name ?? "HerFlower member"}</div>
                    <div className="small">{new Date(comment.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <p className="lead">{comment.body}</p>
                <div className="actions">
                  <button className="tag tag-button" onClick={() => reportComment(comment)}>Report comment</button>
                </div>
              </article>
            ))}
            {!isLoading && comments.length === 0 ? <p className="lead">No comments yet. Be the first to reply.</p> : null}
          </div>
        </div>
      </RequireApproved>
    </AppShell>
  );
}
