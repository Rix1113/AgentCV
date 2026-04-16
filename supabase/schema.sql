create table if not exists public.projects (
  id text primary key,
  user_id text not null,
  title text not null,
  cv_text text,
  job_ad_text text,
  analysis jsonb,
  documents jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists projects_user_id_updated_at_idx
  on public.projects (user_id, updated_at desc);

create table if not exists public.usage_events (
  id text primary key,
  user_id text,
  event_type text not null check (
    event_type in (
      'page_view',
      'project_created',
      'project_documents_updated',
      'analysis_generated',
      'documents_generated',
      'section_regenerated',
      'exported_pdf',
      'exported_docx',
      'admin_analytics_viewed',
      'admin_user_plan_updated'
    )
  ),
  route text,
  project_id text,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists usage_events_user_id_created_at_idx
  on public.usage_events (user_id, created_at desc);

create index if not exists usage_events_event_type_created_at_idx
  on public.usage_events (event_type, created_at desc);

create index if not exists usage_events_project_id_idx
  on public.usage_events (project_id);

create table if not exists public.user_profiles (
  user_id text primary key,
  email text,
  plan text not null check (plan in ('free', 'pro')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_profiles_plan_updated_at_idx
  on public.user_profiles (plan, updated_at desc);

alter table public.projects enable row level security;
alter table public.usage_events enable row level security;
alter table public.user_profiles enable row level security;
