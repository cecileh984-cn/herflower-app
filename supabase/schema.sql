create type public.review_status as enum ('pending', 'approved', 'rejected', 'banned');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  age_range text,
  country text,
  city text,
  languages_spoken text[] default '{}',
  languages_learning text[] default '{}',
  interests text[] default '{}',
  looking_for text[] default '{}',
  bio text,
  avatar_url text,
  review_status public.review_status not null default 'pending',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  selfie_path text not null,
  id_document_path text not null,
  status public.review_status not null default 'pending',
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  tags text[] default '{}',
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  constraint different_members check (user_a <> user_b)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  reported boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);
