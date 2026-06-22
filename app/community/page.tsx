"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { RequireApproved } from "../components/AccessGate";
import { AppShell } from "../components/AppShell";
import { Avatar } from "../components/Avatar";
import { createPost, createReport, listPosts, PostWithCommentCount } from "../lib/community";

const communityCategories = ["All", "Friends", "Travel", "Language", "Support", "Local"];

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostWithCommentCount[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("Friends");
  const [activeCategory, setActiveCategory] = useState("All");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const visiblePosts = activeCategory === "All"
    ? posts
    : posts.filter((post) => post.tags?.some((postTag) => postTag.toLowerCase() === activeCategory.toLowerCase()));

  async function refreshPosts(options: { silent?: boolean } = {}) {
    if (!options.silent) {
      setIsLoading(true);
      setStatusMessage("");
    }

    try {
      setPosts(await listPosts());
      setLastRefreshedAt(new Date().toLocaleTimeString());
    } catch (error) {
      if (!options.silent) {
        setStatusMessage(error instanceof Error ? error.message : "Could not load posts.");
      }
    } finally {
      if (!options.silent) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    refreshPosts();
    const interval = window.setInterval(() => {
      refreshPosts({ silent: true });
    }, 10000);

    return () => window.clearInterval(interval);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await createPost({ title, body, tag });
      setTitle("");
      setBody("");
      setActiveCategory(tag);
      await refreshPosts();
      setStatusMessage("Post published to Supabase.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not publish post.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reportPost(post: PostWithCommentCount) {
    try {
      await createReport({
        targetType: "post",
        targetId: post.id,
        reportedUserId: post.author_id,
        reason: "Post reported from Community list"
      });
      setStatusMessage("Report submitted.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not submit report.");
    }
  }

  return (
    <AppShell>
      <RequireApproved>
        <div className="content">
          <div className="section-head">
            <div>
              <h2>Community</h2>
              <p className="lead">A public space for verified members to post, comment, and find women with shared plans or interests.</p>
            </div>
            <div className="actions">
              <span className="tag">{lastRefreshedAt ? `Updated ${lastRefreshedAt}` : "Auto-refreshing"}</span>
              <button className="btn btn-secondary" onClick={() => refreshPosts()}>Refresh</button>
            </div>
          </div>
          <form className="card grid" onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
            <label>Post title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Looking for friends in..." required /></label>
            <label>Category<select value={tag} onChange={(event) => setTag(event.target.value)}>
              {communityCategories.filter((option) => option !== "All").map((option) => <option key={option}>{option}</option>)}
            </select></label>
            <label>Post<textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write something kind and specific..." required /></label>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Publishing..." : "Publish post"}</button>
          </form>
          {statusMessage ? <p className="lead">{statusMessage}</p> : null}
          <div className="filters">
            {communityCategories.map((filter) => (
              <button
                className={`filter tag-button ${activeCategory === filter ? "active" : ""}`}
                key={filter}
                onClick={() => setActiveCategory(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="grid">
            {isLoading ? <p className="lead">Loading posts...</p> : null}
            {!isLoading && posts.length === 0 ? <p className="lead">No posts yet. Publish the first HerFlower community post.</p> : null}
            {!isLoading && posts.length > 0 && visiblePosts.length === 0 ? (
              <p className="lead">No {activeCategory} posts yet. Start the first one.</p>
            ) : null}
            {visiblePosts.map((post) => (
              <article className="card" key={post.id}>
                <Link className="card-name" href={`/post/${post.id}`}>{post.title}</Link>
                <div className="avatar-row" style={{ marginTop: 10 }}>
                  <Avatar name={post.authorProfile?.display_name} src={post.authorProfile?.avatar_url} />
                  <div className="small">
                    By {post.authorProfile?.display_name ?? "HerFlower member"}
                    {" - "}
                    {[post.authorProfile?.city, post.authorProfile?.country].filter(Boolean).join(", ") || "Global member"}
                    {post.authorProfile?.languages_spoken?.length ? ` - ${post.authorProfile.languages_spoken.join(", ")}` : ""}
                  </div>
                </div>
                <p className="lead">{post.body}</p>
                <div className="actions">
                  <span className="tag">{post.tags?.[0] ?? "General"}</span>
                  <span className="tag">{new Date(post.created_at).toLocaleString()}</span>
                  <span className="tag">{post.comment_count} comments</span>
                  <Link className="tag" href={`/post/${post.id}`}>Open</Link>
                  <button className="tag tag-button" onClick={() => reportPost(post)}>Report</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </RequireApproved>
    </AppShell>
  );
}
