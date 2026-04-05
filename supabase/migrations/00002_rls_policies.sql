-- =============================================================================
-- Livsplanlegg - Personal Operating System
-- Migration 00002: Row Level Security Policies
-- =============================================================================

-- =============================================================================
-- PROFILES
-- =============================================================================

alter table profiles enable row level security;

create policy "profiles_select_own"
  on profiles for select
  using (id = auth.uid());

create policy "profiles_insert_own"
  on profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_delete_own"
  on profiles for delete
  using (id = auth.uid());

-- =============================================================================
-- AREAS
-- =============================================================================

alter table areas enable row level security;

create policy "areas_select_own"
  on areas for select
  using (user_id = auth.uid());

create policy "areas_insert_own"
  on areas for insert
  with check (user_id = auth.uid());

create policy "areas_update_own"
  on areas for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "areas_delete_own"
  on areas for delete
  using (user_id = auth.uid());

-- =============================================================================
-- GOALS
-- =============================================================================

alter table goals enable row level security;

create policy "goals_select_own"
  on goals for select
  using (user_id = auth.uid());

create policy "goals_insert_own"
  on goals for insert
  with check (user_id = auth.uid());

create policy "goals_update_own"
  on goals for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "goals_delete_own"
  on goals for delete
  using (user_id = auth.uid());

-- =============================================================================
-- PROJECTS
-- =============================================================================

alter table projects enable row level security;

create policy "projects_select_own"
  on projects for select
  using (user_id = auth.uid());

create policy "projects_insert_own"
  on projects for insert
  with check (user_id = auth.uid());

create policy "projects_update_own"
  on projects for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "projects_delete_own"
  on projects for delete
  using (user_id = auth.uid());

-- =============================================================================
-- TENDERS
-- =============================================================================

alter table tenders enable row level security;

create policy "tenders_select_own"
  on tenders for select
  using (user_id = auth.uid());

create policy "tenders_insert_own"
  on tenders for insert
  with check (user_id = auth.uid());

create policy "tenders_update_own"
  on tenders for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "tenders_delete_own"
  on tenders for delete
  using (user_id = auth.uid());

-- =============================================================================
-- EVENTS
-- =============================================================================

alter table events enable row level security;

create policy "events_select_own"
  on events for select
  using (user_id = auth.uid());

create policy "events_insert_own"
  on events for insert
  with check (user_id = auth.uid());

create policy "events_update_own"
  on events for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "events_delete_own"
  on events for delete
  using (user_id = auth.uid());

-- =============================================================================
-- TASKS
-- =============================================================================

alter table tasks enable row level security;

create policy "tasks_select_own"
  on tasks for select
  using (user_id = auth.uid());

create policy "tasks_insert_own"
  on tasks for insert
  with check (user_id = auth.uid());

create policy "tasks_update_own"
  on tasks for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "tasks_delete_own"
  on tasks for delete
  using (user_id = auth.uid());

-- =============================================================================
-- TASK_LOGS
-- =============================================================================

alter table task_logs enable row level security;

create policy "task_logs_select_own"
  on task_logs for select
  using (user_id = auth.uid());

create policy "task_logs_insert_own"
  on task_logs for insert
  with check (user_id = auth.uid());

create policy "task_logs_update_own"
  on task_logs for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "task_logs_delete_own"
  on task_logs for delete
  using (user_id = auth.uid());

-- =============================================================================
-- RECURRING_TEMPLATES
-- =============================================================================

alter table recurring_templates enable row level security;

create policy "recurring_templates_select_own"
  on recurring_templates for select
  using (user_id = auth.uid());

create policy "recurring_templates_insert_own"
  on recurring_templates for insert
  with check (user_id = auth.uid());

create policy "recurring_templates_update_own"
  on recurring_templates for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "recurring_templates_delete_own"
  on recurring_templates for delete
  using (user_id = auth.uid());

-- =============================================================================
-- INBOX_ITEMS
-- =============================================================================

alter table inbox_items enable row level security;

create policy "inbox_items_select_own"
  on inbox_items for select
  using (user_id = auth.uid());

create policy "inbox_items_insert_own"
  on inbox_items for insert
  with check (user_id = auth.uid());

create policy "inbox_items_update_own"
  on inbox_items for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "inbox_items_delete_own"
  on inbox_items for delete
  using (user_id = auth.uid());

-- =============================================================================
-- NOTES
-- =============================================================================

alter table notes enable row level security;

create policy "notes_select_own"
  on notes for select
  using (user_id = auth.uid());

create policy "notes_insert_own"
  on notes for insert
  with check (user_id = auth.uid());

create policy "notes_update_own"
  on notes for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notes_delete_own"
  on notes for delete
  using (user_id = auth.uid());

-- =============================================================================
-- REVIEWS
-- =============================================================================

alter table reviews enable row level security;

create policy "reviews_select_own"
  on reviews for select
  using (user_id = auth.uid());

create policy "reviews_insert_own"
  on reviews for insert
  with check (user_id = auth.uid());

create policy "reviews_update_own"
  on reviews for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reviews_delete_own"
  on reviews for delete
  using (user_id = auth.uid());

-- =============================================================================
-- FINANCE_ITEMS
-- =============================================================================

alter table finance_items enable row level security;

create policy "finance_items_select_own"
  on finance_items for select
  using (user_id = auth.uid());

create policy "finance_items_insert_own"
  on finance_items for insert
  with check (user_id = auth.uid());

create policy "finance_items_update_own"
  on finance_items for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "finance_items_delete_own"
  on finance_items for delete
  using (user_id = auth.uid());

-- =============================================================================
-- FINANCE_CATEGORIES
-- =============================================================================

alter table finance_categories enable row level security;

create policy "finance_categories_select_own"
  on finance_categories for select
  using (user_id = auth.uid());

create policy "finance_categories_insert_own"
  on finance_categories for insert
  with check (user_id = auth.uid());

create policy "finance_categories_update_own"
  on finance_categories for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "finance_categories_delete_own"
  on finance_categories for delete
  using (user_id = auth.uid());

-- =============================================================================
-- ATTACHMENTS
-- =============================================================================

alter table attachments enable row level security;

create policy "attachments_select_own"
  on attachments for select
  using (user_id = auth.uid());

create policy "attachments_insert_own"
  on attachments for insert
  with check (user_id = auth.uid());

create policy "attachments_update_own"
  on attachments for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "attachments_delete_own"
  on attachments for delete
  using (user_id = auth.uid());

-- =============================================================================
-- TRAINING_PLANS
-- =============================================================================

alter table training_plans enable row level security;

create policy "training_plans_select_own"
  on training_plans for select
  using (user_id = auth.uid());

create policy "training_plans_insert_own"
  on training_plans for insert
  with check (user_id = auth.uid());

create policy "training_plans_update_own"
  on training_plans for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "training_plans_delete_own"
  on training_plans for delete
  using (user_id = auth.uid());

-- =============================================================================
-- WORKOUT_SESSIONS
-- =============================================================================

alter table workout_sessions enable row level security;

create policy "workout_sessions_select_own"
  on workout_sessions for select
  using (user_id = auth.uid());

create policy "workout_sessions_insert_own"
  on workout_sessions for insert
  with check (user_id = auth.uid());

create policy "workout_sessions_update_own"
  on workout_sessions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "workout_sessions_delete_own"
  on workout_sessions for delete
  using (user_id = auth.uid());

-- =============================================================================
-- VOICE_COMMANDS
-- =============================================================================

alter table voice_commands enable row level security;

create policy "voice_commands_select_own"
  on voice_commands for select
  using (user_id = auth.uid());

create policy "voice_commands_insert_own"
  on voice_commands for insert
  with check (user_id = auth.uid());

create policy "voice_commands_update_own"
  on voice_commands for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "voice_commands_delete_own"
  on voice_commands for delete
  using (user_id = auth.uid());

-- =============================================================================
-- AI_AGENT_RUNS
-- =============================================================================

alter table ai_agent_runs enable row level security;

create policy "ai_agent_runs_select_own"
  on ai_agent_runs for select
  using (user_id = auth.uid());

create policy "ai_agent_runs_insert_own"
  on ai_agent_runs for insert
  with check (user_id = auth.uid());

create policy "ai_agent_runs_update_own"
  on ai_agent_runs for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "ai_agent_runs_delete_own"
  on ai_agent_runs for delete
  using (user_id = auth.uid());

-- =============================================================================
-- AI_ACTION_AUDIT
-- =============================================================================

alter table ai_action_audit enable row level security;

create policy "ai_action_audit_select_own"
  on ai_action_audit for select
  using (user_id = auth.uid());

create policy "ai_action_audit_insert_own"
  on ai_action_audit for insert
  with check (user_id = auth.uid());

create policy "ai_action_audit_update_own"
  on ai_action_audit for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "ai_action_audit_delete_own"
  on ai_action_audit for delete
  using (user_id = auth.uid());

-- =============================================================================
-- USER_PREFERENCES
-- =============================================================================

alter table user_preferences enable row level security;

create policy "user_preferences_select_own"
  on user_preferences for select
  using (user_id = auth.uid());

create policy "user_preferences_insert_own"
  on user_preferences for insert
  with check (user_id = auth.uid());

create policy "user_preferences_update_own"
  on user_preferences for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "user_preferences_delete_own"
  on user_preferences for delete
  using (user_id = auth.uid());
