-- 金巴崙長老會沙田堂
-- 2026 先知性群體——小先知書速覽
-- PostgreSQL schema (Neon / Supabase Postgres)

-- Extensions (Supabase 通常已啟用；Neon 可自行啟用)
create extension if not exists pgcrypto;

-- 1) users
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text not null,
  note text default '',
  avatar_url text,
  avatar_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) courses (固定 10 堂)
create table if not exists courses (
  id int primary key,
  title text not null,
  badge_key text not null,
  speaker text not null,
  chapters_count int not null,
  event_date date not null
);

-- 3) quiz questions (每堂 10 題)
create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  course_id int not null references courses(id) on delete cascade,
  order_index int not null,
  question_text text not null,
  options jsonb not null,      -- ["A","B","C","D"]
  correct_index int not null,  -- 0..3
  updated_at timestamptz not null default now(),
  unique(course_id, order_index)
);

-- 4) user progress per course
create table if not exists user_course_progress (
  user_id uuid not null references app_users(id) on delete cascade,
  course_id int not null references courses(id) on delete cascade,
  read_chapters int[] not null default '{}',
  quiz_score int,
  attendance_type text, -- 'live' | 'replay' | null
  attendance_link text,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- 5) community posts (Threads style)
create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  content text not null,
  badge_course_id int references courses(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 6) likes (不顯示數量，但需可持久化)
create table if not exists post_likes (
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ---- Seed courses (id 固定，badge_key 對應 public/badges 檔名) ----
insert into courses (id, title, badge_key, speaker, chapters_count, event_date) values
  (1, '何西阿書', 'hosea', '蕭楚剛牧師', 14, '2026-03-05'),
  (2, '約珥書', 'joel', '梁浩威傳道', 3, '2026-04-02'),
  (3, '阿摩司書', 'amos', '林凱倫傳道', 9, '2026-05-07'),
  (4, '約拿書', 'jonah', '林素華傳道', 4, '2026-06-04'),
  (5, '彌迦書', 'micah', '徐天睿弟兄', 7, '2026-07-02'),
  (6, '那鴻書', 'nahum', '冼浚瑋弟兄', 3, '2026-08-06'),
  (7, '哈巴谷書', 'habakkuk', '梁浩威傳道', 3, '2026-09-03'),
  (8, '西番亞書', 'zephaniah', '林凱倫傳道', 3, '2026-10-08'),
  (9, '哈該書', 'haggai', '林素華傳道', 2, '2026-11-05'),
  (10, '瑪拉基書', 'malachi', '蕭楚剛牧師', 4, '2026-12-03')
on conflict (id) do nothing;

