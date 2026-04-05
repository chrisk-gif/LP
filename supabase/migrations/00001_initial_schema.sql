-- =============================================================================
-- Livsplanlegg - Personal Operating System
-- Migration 00001: Initial Schema
-- =============================================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp" with schema extensions;

-- Enable pgvector for future AI/embedding features (uncomment when needed)
-- create extension if not exists "vector" with schema extensions;

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

create type goal_horizon as enum (
  'short-term', 'monthly', 'quarterly', 'yearly', 'long-term'
);

create type goal_status as enum (
  'active', 'completed', 'paused', 'archived'
);

create type project_status as enum (
  'active', 'backlog', 'completed', 'archived'
);

create type priority_level as enum (
  'critical', 'high', 'medium', 'low'
);

create type tender_status as enum (
  'identified', 'preparing', 'submitted', 'won', 'lost', 'cancelled'
);

create type risk_level as enum (
  'low', 'medium', 'high', 'critical'
);

create type sensitivity_level as enum (
  'normal', 'confidential', 'restricted'
);

create type task_status as enum (
  'inbox', 'todo', 'in_progress', 'waiting', 'done', 'archived'
);

create type energy_level as enum (
  'high', 'medium', 'low'
);

create type task_source as enum (
  'manual', 'ai', 'voice', 'recurring', 'import'
);

create type task_log_type as enum (
  'comment', 'status_change', 'update'
);

create type event_type as enum (
  'meeting', 'deadline', 'reminder', 'block', 'personal', 'other'
);

create type recurring_entity_type as enum (
  'task', 'event', 'finance'
);

create type inbox_item_type as enum (
  'task', 'idea', 'note', 'bill', 'event', 'training', 'voice_memo'
);

create type inbox_source as enum (
  'manual', 'voice', 'ai'
);

create type review_period as enum (
  'daily', 'weekly', 'monthly', 'quarterly'
);

create type finance_type as enum (
  'bill', 'subscription', 'receipt', 'reimbursement', 'savings', 'investment', 'other'
);

create type finance_status as enum (
  'upcoming', 'due', 'overdue', 'paid', 'archived'
);

create type training_status as enum (
  'active', 'completed', 'paused'
);

create type workout_intensity as enum (
  'easy', 'moderate', 'hard', 'max'
);

-- =============================================================================
-- HELPER FUNCTION: auto-update updated_at
-- =============================================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================================
-- TABLE: profiles
-- =============================================================================

create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url  text,
  locale      text not null default 'nb-NO',
  timezone    text not null default 'Europe/Oslo',
  currency    text not null default 'NOK',
  preferences jsonb default '{}'::jsonb,
  onboarding_completed boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: areas
-- =============================================================================

create table areas (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  slug        text not null,
  name        text not null,
  color       text,
  icon        text,
  sort_order  int not null default 0,
  is_system   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, slug)
);

create index idx_areas_user_id on areas(user_id);

create trigger areas_updated_at
  before update on areas
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: goals
-- =============================================================================

create table goals (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles(id) on delete cascade,
  area_id           uuid not null references areas(id) on delete cascade,
  title             text not null,
  description       text,
  horizon           goal_horizon not null default 'quarterly',
  status            goal_status not null default 'active',
  target_date       date,
  measurable_metric text,
  current_progress  numeric default 0,
  why_it_matters    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_goals_user_id on goals(user_id);
create index idx_goals_area_id on goals(area_id);
create index idx_goals_status on goals(status);

create trigger goals_updated_at
  before update on goals
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: projects
-- =============================================================================

create table projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  area_id     uuid not null references areas(id) on delete cascade,
  goal_id     uuid references goals(id) on delete set null,
  title       text not null,
  description text,
  type        text,
  status      project_status not null default 'active',
  priority    priority_level not null default 'medium',
  start_date  date,
  due_date    date,
  progress    numeric not null default 0,
  notes       text,
  archived    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_projects_user_id on projects(user_id);
create index idx_projects_area_id on projects(area_id);
create index idx_projects_goal_id on projects(goal_id);
create index idx_projects_status on projects(status);
create index idx_projects_due_date on projects(due_date);

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: tenders
-- =============================================================================

create table tenders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles(id) on delete cascade,
  area_id          uuid not null references areas(id) on delete cascade,
  project_id       uuid references projects(id) on delete set null,
  title            text not null,
  client           text,
  due_date         date,
  status           tender_status not null default 'identified',
  probability      int,
  risk_level       risk_level default 'medium',
  next_milestone   text,
  submitted_at     timestamptz,
  won_lost_status  text,
  lessons_learned  text,
  sensitivity      sensitivity_level not null default 'confidential',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_tenders_user_id on tenders(user_id);
create index idx_tenders_area_id on tenders(area_id);
create index idx_tenders_project_id on tenders(project_id);
create index idx_tenders_status on tenders(status);
create index idx_tenders_due_date on tenders(due_date);

create trigger tenders_updated_at
  before update on tenders
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: events
-- =============================================================================

create table events (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles(id) on delete cascade,
  area_id           uuid not null references areas(id) on delete cascade,
  project_id        uuid references projects(id) on delete set null,
  tender_id         uuid references tenders(id) on delete set null,
  title             text not null,
  description       text,
  event_type        event_type not null default 'other',
  start_time        timestamptz not null,
  end_time          timestamptz not null,
  all_day           boolean not null default false,
  location          text,
  recurrence_pattern text,
  color             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_events_user_id on events(user_id);
create index idx_events_area_id on events(area_id);
create index idx_events_start_time on events(start_time);
create index idx_events_end_time on events(end_time);

create trigger events_updated_at
  before update on events
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: tasks
-- =============================================================================

create table tasks (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  area_id             uuid not null references areas(id) on delete cascade,
  project_id          uuid references projects(id) on delete set null,
  goal_id             uuid references goals(id) on delete set null,
  tender_id           uuid references tenders(id) on delete set null,
  event_id            uuid references events(id) on delete set null,
  title               text not null,
  description         text,
  status              task_status not null default 'inbox',
  priority            priority_level not null default 'medium',
  energy_level        energy_level,
  due_date            date,
  scheduled_date      date,
  scheduled_time      time,
  estimated_minutes   int,
  recurrence_pattern  text,
  tags                text[] default '{}',
  source              task_source not null default 'manual',
  created_by_ai       boolean not null default false,
  ai_confidence       numeric,
  sort_order          int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_tasks_user_id on tasks(user_id);
create index idx_tasks_area_id on tasks(area_id);
create index idx_tasks_project_id on tasks(project_id);
create index idx_tasks_goal_id on tasks(goal_id);
create index idx_tasks_tender_id on tasks(tender_id);
create index idx_tasks_event_id on tasks(event_id);
create index idx_tasks_status on tasks(status);
create index idx_tasks_due_date on tasks(due_date);
create index idx_tasks_scheduled_date on tasks(scheduled_date);
create index idx_tasks_priority on tasks(priority);

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: task_logs
-- =============================================================================

create table task_logs (
  id         uuid primary key default uuid_generate_v4(),
  task_id    uuid not null references tasks(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  content    text,
  type       task_log_type not null default 'comment',
  created_at timestamptz not null default now()
);

create index idx_task_logs_task_id on task_logs(task_id);
create index idx_task_logs_user_id on task_logs(user_id);

-- =============================================================================
-- TABLE: recurring_templates
-- =============================================================================

create table recurring_templates (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  entity_type     recurring_entity_type not null,
  template_data   jsonb not null default '{}'::jsonb,
  recurrence_rule text not null,
  next_occurrence date,
  last_generated  date,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_recurring_templates_user_id on recurring_templates(user_id);
create index idx_recurring_templates_next_occurrence on recurring_templates(next_occurrence);

create trigger recurring_templates_updated_at
  before update on recurring_templates
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: inbox_items
-- =============================================================================

create table inbox_items (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references profiles(id) on delete cascade,
  content        text not null,
  item_type      inbox_item_type,
  area_id        uuid references areas(id) on delete set null,
  processed      boolean not null default false,
  processed_at   timestamptz,
  source         inbox_source not null default 'manual',
  raw_transcript text,
  created_at     timestamptz not null default now()
);

create index idx_inbox_items_user_id on inbox_items(user_id);
create index idx_inbox_items_processed on inbox_items(processed);

-- =============================================================================
-- TABLE: notes
-- =============================================================================

create table notes (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  area_id    uuid references areas(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  tender_id  uuid references tenders(id) on delete set null,
  title      text not null,
  content    text,
  pinned     boolean not null default false,
  tags       text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_notes_user_id on notes(user_id);
create index idx_notes_area_id on notes(area_id);
create index idx_notes_project_id on notes(project_id);
create index idx_notes_tender_id on notes(tender_id);

create trigger notes_updated_at
  before update on notes
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: reviews
-- =============================================================================

create table reviews (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles(id) on delete cascade,
  period           review_period not null,
  period_start     date not null,
  period_end       date not null,
  wins             text,
  blockers         text,
  lessons_learned  text,
  next_focus       text,
  freeform_notes   text,
  metrics_snapshot jsonb default '{}'::jsonb,
  ai_generated     boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_reviews_user_id on reviews(user_id);
create index idx_reviews_period on reviews(period);
create index idx_reviews_period_start on reviews(period_start);

create trigger reviews_updated_at
  before update on reviews
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: finance_items
-- =============================================================================

create table finance_items (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references profiles(id) on delete cascade,
  title                 text not null,
  description           text,
  type                  finance_type not null default 'bill',
  status                finance_status not null default 'upcoming',
  amount                numeric,
  currency              text not null default 'NOK',
  vendor                text,
  category              text,
  due_date              date,
  paid_date             date,
  recurrence_pattern    text,
  reminder_days_before  int not null default 3,
  notes                 text,
  attachment_id         uuid,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_finance_items_user_id on finance_items(user_id);
create index idx_finance_items_status on finance_items(status);
create index idx_finance_items_due_date on finance_items(due_date);
create index idx_finance_items_type on finance_items(type);

create trigger finance_items_updated_at
  before update on finance_items
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: finance_categories
-- =============================================================================

create table finance_categories (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  name       text not null,
  color      text,
  icon       text,
  created_at timestamptz not null default now()
);

create index idx_finance_categories_user_id on finance_categories(user_id);

-- =============================================================================
-- TABLE: attachments
-- =============================================================================

create table attachments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  file_name   text not null,
  file_path   text not null,
  file_type   text,
  file_size   bigint,
  bucket      text not null,
  entity_type text,
  entity_id   uuid,
  created_at  timestamptz not null default now()
);

create index idx_attachments_user_id on attachments(user_id);
create index idx_attachments_entity on attachments(entity_type, entity_id);

-- =============================================================================
-- TABLE: training_plans
-- =============================================================================

create table training_plans (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  title       text not null,
  description text,
  goal_id     uuid references goals(id) on delete set null,
  start_date  date,
  end_date    date,
  status      training_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_training_plans_user_id on training_plans(user_id);
create index idx_training_plans_status on training_plans(status);

create trigger training_plans_updated_at
  before update on training_plans
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: workout_sessions
-- =============================================================================

create table workout_sessions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles(id) on delete cascade,
  plan_id          uuid references training_plans(id) on delete set null,
  title            text not null,
  session_type     text,
  planned_at       timestamptz,
  completed_at     timestamptz,
  duration_minutes int,
  intensity        workout_intensity,
  notes            text,
  metrics          jsonb default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_workout_sessions_user_id on workout_sessions(user_id);
create index idx_workout_sessions_plan_id on workout_sessions(plan_id);
create index idx_workout_sessions_planned_at on workout_sessions(planned_at);

create trigger workout_sessions_updated_at
  before update on workout_sessions
  for each row execute function update_updated_at_column();

-- =============================================================================
-- TABLE: voice_commands
-- =============================================================================

create table voice_commands (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references profiles(id) on delete cascade,
  raw_transcript        text,
  normalized_transcript text,
  detected_intent       text,
  confidence            numeric,
  executed_actions      jsonb default '[]'::jsonb,
  result                text,
  audio_file_path       text,
  language              text not null default 'nb-NO',
  created_at            timestamptz not null default now()
);

create index idx_voice_commands_user_id on voice_commands(user_id);

-- =============================================================================
-- TABLE: ai_agent_runs
-- =============================================================================

create table ai_agent_runs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  agent_name  text not null,
  input_text  text,
  output_text text,
  model_used  text,
  tokens_used int,
  duration_ms int,
  success     boolean not null default true,
  error       text,
  created_at  timestamptz not null default now()
);

create index idx_ai_agent_runs_user_id on ai_agent_runs(user_id);
create index idx_ai_agent_runs_agent_name on ai_agent_runs(agent_name);

-- =============================================================================
-- TABLE: ai_action_audit
-- =============================================================================

create table ai_action_audit (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles(id) on delete cascade,
  agent_name        text not null,
  action_type       text not null,
  entity_type       text,
  entity_id         uuid,
  input_data        jsonb default '{}'::jsonb,
  output_data       jsonb default '{}'::jsonb,
  confidence        numeric,
  auto_executed     boolean not null default false,
  confirmed_by_user boolean not null default false,
  undone            boolean not null default false,
  created_at        timestamptz not null default now()
);

create index idx_ai_action_audit_user_id on ai_action_audit(user_id);
create index idx_ai_action_audit_entity on ai_action_audit(entity_type, entity_id);

-- =============================================================================
-- TABLE: user_preferences
-- =============================================================================

create table user_preferences (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid unique not null references profiles(id) on delete cascade,
  working_hours            jsonb default '{"start": "08:00", "end": "16:00", "days": [1,2,3,4,5]}'::jsonb,
  planning_style           text default 'balanced',
  review_cadence           jsonb default '{"daily": true, "weekly": true, "monthly": true, "quarterly": true}'::jsonb,
  finance_reminder_defaults jsonb default '{"days_before": 3, "notify_via": ["push"]}'::jsonb,
  training_defaults        jsonb default '{"preferred_time": "07:00", "default_duration_minutes": 60}'::jsonb,
  ai_auto_execute          boolean not null default false,
  voice_tts_enabled        boolean not null default true,
  theme                    text not null default 'system',
  dashboard_widgets        jsonb default '["tasks","calendar","finance","training"]'::jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index idx_user_preferences_user_id on user_preferences(user_id);

create trigger user_preferences_updated_at
  before update on user_preferences
  for each row execute function update_updated_at_column();

-- =============================================================================
-- Auto-create profile and default areas on user signup
-- =============================================================================

create or replace function handle_new_user()
returns trigger as $$
declare
  new_profile_id uuid;
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  returning id into new_profile_id;

  insert into areas (user_id, slug, name, color, icon, sort_order, is_system) values
    (new_profile_id, 'privat',       'Privat',       '#3B82F6', 'Home',       0, true),
    (new_profile_id, 'jobb',         'Jobb',         '#F59E0B', 'Briefcase',  1, true),
    (new_profile_id, 'helse',        'Helse',        '#10B981', 'Heart',      2, true),
    (new_profile_id, 'okonomi',      'Okonomi',      '#8B5CF6', 'Wallet',     3, true),
    (new_profile_id, 'asplan-viak',  'Asplan Viak',  '#EF4444', 'Building2',  4, true);

  insert into user_preferences (user_id) values (new_profile_id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
