-- ============================================================================
-- Module 1: Knowledge Base
-- ============================================================================
create table meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meeting_date date,
  participants text[],
  raw_transcript text not null,
  source text,                       -- 'granola', 'manual_paste', 'upload'
  processed boolean default false,
  created_at timestamptz default now()
);

create table kb_entries (
  id uuid primary key default gen_random_uuid(),
  source_meeting_id uuid references meetings(id) on delete set null,
  category text not null,            -- 'strategy', 'voice', 'banned-word', 'audience', 'topic-priority'
  fact text not null,
  confidence numeric default 0.8,    -- 0-1
  applied_to_files text[],           -- ['SKILL.md', 'voice-rules.md']
  status text default 'pending',     -- 'pending', 'approved', 'rejected', 'applied'
  embedding vector(1024),            -- voyage-3-large
  created_at timestamptz default now()
);

create index kb_entries_embedding_idx on kb_entries
  using ivfflat (embedding vector_cosine_ops);

create table kb_changes (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  change_summary text,
  diff_before text,
  diff_after text,
  applied_at timestamptz default now()
);

-- ============================================================================
-- Module 2: Title Generator
-- ============================================================================
create table titles (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  generated_title text not null,
  framework text,                    -- 'magic', 'turn-into', 'transformation', etc.
  rule_score int,                    -- 0-5
  slop_prob numeric,                 -- 0-1
  novelty_overlap numeric,           -- 0-1
  verdict text,                      -- 'pass', 'warn', 'reject'
  tools_named text[],
  channel_named text,
  product_type text,
  rationale text,
  created_at timestamptz default now()
);

create table title_feedback (
  id uuid primary key default gen_random_uuid(),
  title_id uuid references titles(id) on delete cascade,
  action text not null,              -- 'accepted', 'rejected', 'edited'
  edited_version text,
  reason text,
  created_at timestamptz default now()
);

-- ============================================================================
-- Module 3: Retention
-- ============================================================================
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  status text,                       -- 'active', 'churned', 'paused'
  joined_date date,
  churned_date date,
  churn_reason text,
  churn_category text,               -- clustered category from Claude
  ltv_cents int,
  source text,                       -- 'nas.com', 'direct', 'unknown'
  created_at timestamptz default now()
);

create table cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  criteria jsonb,                    -- {churn_reason: 'price', joined_after: '2025-01-01'}
  subscriber_count int,
  avg_ltv_cents int,
  created_at timestamptz default now()
);

create table retention_experiments (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid references cohorts(id) on delete cascade,
  hypothesis text,
  action text,
  predicted_impact text,
  status text default 'proposed',    -- 'proposed', 'running', 'shipped', 'killed'
  created_at timestamptz default now()
);

-- ============================================================================
-- Module 4: Campaign Drafter
-- ============================================================================
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,                         -- 'email', 'social-post', 'whatsapp', 'in-app'
  brief text,                        -- input brief from user
  status text default 'draft',       -- 'draft', 'approved', 'exported'
  target_audience text,
  created_at timestamptz default now()
);

create table campaign_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  asset_type text,                   -- 'subject_line', 'email_body', 'social_post', 'cta'
  sequence_position int,             -- for multi-step sequences
  content text,
  variant text,                      -- 'a', 'b' for A/B
  created_at timestamptz default now()
);

-- ============================================================================
-- Module 5: Analytics
-- ============================================================================
create table sessions (
  id uuid primary key default gen_random_uuid(),
  session_date date,
  day_of_week text,
  type text,                         -- 'Marketing Monday', 'Tool Tuesday', etc.
  title text,
  speaker text,
  host text,
  tools_taught text[],
  signups int,
  attendance int,
  peak int,
  rating numeric,
  coolest_moment text,
  imported_from text,                -- 'google-sheet', 'manual'
  external_id text,                  -- to dedupe on re-import
  created_at timestamptz default now()
);

create table predictions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  predicted_signups int,
  predicted_attendance int,
  predicted_rating numeric,
  confidence numeric,
  comparable_sessions uuid[],        -- references sessions(id)
  generated_at timestamptz default now()
);

-- ============================================================================
-- Module 6: Research
-- ============================================================================
create table research_runs (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  sources_used text[],               -- ['anthropic-web', 'perplexity', 'apify-tiktok']
  raw_results jsonb,
  summary text,                      -- Claude synthesis
  opportunity_score numeric,
  suggested_titles uuid[],           -- references titles(id) seeded from this
  triggered_by text,                 -- 'manual', 'cron'
  created_at timestamptz default now()
);

create table trending_topics (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  source text,                       -- 'reddit', 'tiktok', 'twitter', 'google-trends'
  velocity_score numeric,            -- relative growth
  raw_data jsonb,
  surfaced_at timestamptz default now(),
  used_in_session_id uuid references sessions(id)
);
