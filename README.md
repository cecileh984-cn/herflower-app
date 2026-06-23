# HerFlower MVP

HerFlower is a women-only, verified 18+ global friendship app for finding friends, travel buddies, local plans, language exchange, emotional support, community posts, comments, and private chat.

This MVP uses Next.js and Supabase. It already includes real auth, manual verification, profile avatars, Discover, Community, Messages, Chat, blocking, reporting, admin review, banning, and restoring users.

## Stack

- Next.js 14
- React 18
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Vercel-ready deployment

## Local Setup

Install Node.js LTS first.

```powershell
cd C:\Users\Administrator\Documents\Codex\2026-06-18\new-chat\work\herflower-app
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Build check:

```powershell
npm run build
```

If the page suddenly appears as plain HTML or a giant SVG during development, stop the dev server, delete `.next`, and restart `npm run dev`. Avoid running `npm run build` while `npm run dev` is open because both write to `.next`.

## Environment Variables

Create `.env.local` from `.env.example`:

```text
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Do not commit `.env.local`.

For Vercel, add the same two variables in Project Settings -> Environment Variables.

## Supabase Setup

Create a Supabase project, then run the SQL files in this order from SQL Editor:

1. `supabase/schema.sql`
2. `supabase/rls.sql`
3. `supabase/storage.sql`
4. `supabase/chat-safety.sql`
5. `supabase/banned-safety.sql`
6. `supabase/avatar-storage.sql`
7. `supabase/deletion-requests.sql`
8. `supabase/beta-feedback.sql`

## Storage Buckets

Create these buckets in Supabase Storage:

| Bucket | Public | Purpose |
| --- | --- | --- |
| `verification-selfies` | No | Private selfie verification files |
| `verification-documents` | No | Private ID verification files |
| `profile-avatars` | Yes | Public profile photos |

The verification buckets must stay private. The avatar bucket is public because avatars are shown in Discover, Messages, Chat, Community, and Profile.

## First Admin

After the first account is created, mark it as admin in Supabase SQL Editor:

```sql
update public.profiles
set is_admin = true
where id = (
  select id
  from auth.users
  where email = 'your-admin-email@example.com'
);
```

## MVP Flow

1. Create account.
2. Confirm email.
3. Upload selfie and ID document in Verification.
4. Admin approves the verification.
5. User completes Profile Setup and uploads a public avatar.
6. User can access Discover, Community, Messages, and Chat.
7. Users can report posts, comments, messages, and other users.
8. Admin can resolve reports, hide posts/comments, ban users, and restore banned users.

## Main Pages

- `/` Home
- `/signup` Create account
- `/login` Log in
- `/verify` Verification upload
- `/profile/setup` Edit profile and avatar
- `/discover` Find verified members
- `/community` Posts and comments
- `/post/[id]` Post detail and comments
- `/messages` Conversation list
- `/chat/[id]` Private chat
- `/profile` Public profile preview
- `/admin` Admin review and safety queue
- `/terms` Terms of Service
- `/privacy` Privacy Policy
- `/support` Support and data request information

## Current MVP Features

- Supabase email/password auth
- Manual verification records
- Private selfie and ID upload
- Public profile avatar upload
- Approved-only access gates
- Banned-user access block
- Discover filters
- Community categories
- Posts and comments
- Reports and moderation queue
- Private conversations
- Message reporting
- User blocking
- Admin ban and restore
- Account/data deletion request queue
- Beta feedback form and admin queue
- Light auto-refresh for Chat, Post detail, and Community

## Deployment Notes

The project can be deployed to Vercel after:

1. The Supabase project is configured.
2. All required SQL has been run.
3. All buckets are created.
4. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are added in Vercel.
5. `npm run build` passes locally.

Before each public release, run through `docs/launch-test-checklist.md`.
