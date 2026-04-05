// =============================================================================
// Livsplanlegg – Database Types
// Full Supabase-compatible type definitions for all tables
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type AreaSlug =
  | 'asplan-viak'
  | 'ytly'
  | 'privat'
  | 'okonomi'
  | 'trening';

export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'waiting'
  | 'done'
  | 'cancelled';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export type TenderStatus =
  | 'identified'
  | 'qualifying'
  | 'bid_preparation'
  | 'submitted'
  | 'won'
  | 'lost'
  | 'no_bid'
  | 'cancelled';

export type GoalHorizon = '3_year' | '1_year' | '90_day' | '30_day' | 'weekly';

export type ReviewPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type FinanceStatus = 'pending' | 'completed' | 'reconciled' | 'cancelled';

export type FinanceType = 'income' | 'expense' | 'transfer' | 'investment';

export type EventType =
  | 'meeting'
  | 'deadline'
  | 'reminder'
  | 'focus_block'
  | 'personal'
  | 'travel'
  | 'workout'
  | 'other';

export type RecurrencePattern =
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

// ---------------------------------------------------------------------------
// Row types (what you SELECT from the DB)
// ---------------------------------------------------------------------------

export interface Profile {
  id: string; // uuid, references auth.users
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Area {
  id: string;
  user_id: string;
  name: string;
  slug: AreaSlug;
  description: string | null;
  color: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  area_id: string | null;
  parent_goal_id: string | null;
  title: string;
  description: string | null;
  horizon: GoalHorizon;
  target_date: string | null;
  progress: number; // 0-100
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  area_id: string | null;
  goal_id: string | null;
  name: string;
  description: string | null;
  status: 'active' | 'on_hold' | 'completed' | 'archived';
  start_date: string | null;
  target_date: string | null;
  completed_at: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Tender {
  id: string;
  user_id: string;
  area_id: string | null;
  project_id: string | null;
  title: string;
  client: string | null;
  description: string | null;
  status: TenderStatus;
  estimated_value: number | null;
  currency: string;
  deadline: string | null;
  submission_date: string | null;
  decision_date: string | null;
  probability: number | null; // 0-100
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  area_id: string | null;
  project_id: string | null;
  goal_id: string | null;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  due_time: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  energy_level: 'high' | 'medium' | 'low' | null;
  is_recurring: boolean;
  recurring_template_id: string | null;
  sort_order: number;
  completed_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskLog {
  id: string;
  task_id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  area_id: string | null;
  project_id: string | null;
  title: string;
  description: string | null;
  event_type: EventType;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  location: string | null;
  url: string | null;
  is_recurring: boolean;
  recurring_template_id: string | null;
  external_id: string | null;
  external_source: string | null;
  reminder_minutes: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface RecurringTemplate {
  id: string;
  user_id: string;
  entity_type: 'task' | 'event';
  template_data: Record<string, unknown>;
  recurrence_pattern: RecurrencePattern;
  recurrence_interval: number;
  recurrence_days: number[] | null; // e.g. [1,3,5] for Mon/Wed/Fri
  recurrence_end_date: string | null;
  last_generated_at: string | null;
  next_due_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InboxItem {
  id: string;
  user_id: string;
  content: string;
  source: 'manual' | 'voice' | 'email' | 'api' | 'ai';
  raw_input: string | null;
  parsed_data: Record<string, unknown> | null;
  is_processed: boolean;
  processed_at: string | null;
  result_type: string | null; // e.g. 'task', 'event', 'note'
  result_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  area_id: string | null;
  project_id: string | null;
  goal_id: string | null;
  title: string | null;
  content: string;
  content_type: 'markdown' | 'plaintext' | 'html';
  is_pinned: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string; // 'created' | 'updated' | 'deleted' | 'completed' | ...
  changes: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  period: ReviewPeriod;
  period_start: string;
  period_end: string;
  wins: string | null;
  challenges: string | null;
  lessons: string | null;
  next_period_focus: string | null;
  energy_rating: number | null; // 1-10
  productivity_rating: number | null; // 1-10
  satisfaction_rating: number | null; // 1-10
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceItem {
  id: string;
  user_id: string;
  category_id: string | null;
  area_id: string | null;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  finance_type: FinanceType;
  status: FinanceStatus;
  date: string;
  is_recurring: boolean;
  recurring_template_id: string | null;
  vendor: string | null;
  reference: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface FinanceCategory {
  id: string;
  user_id: string;
  name: string;
  parent_category_id: string | null;
  budget_monthly: number | null;
  color: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  storage_bucket: string;
  created_at: string;
}

export interface TrainingPlan {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  plan_type: 'running' | 'strength' | 'hybrid' | 'cycling' | 'swimming' | 'other';
  start_date: string | null;
  end_date: string | null;
  goal_description: string | null;
  is_active: boolean;
  schedule: Record<string, unknown> | null; // JSON with weekly plan
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  training_plan_id: string | null;
  workout_type: string;
  title: string | null;
  description: string | null;
  scheduled_date: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number | null;
  distance_km: number | null;
  calories: number | null;
  heart_rate_avg: number | null;
  heart_rate_max: number | null;
  perceived_effort: number | null; // 1-10 RPE
  notes: string | null;
  exercises: Record<string, unknown>[] | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoiceCommand {
  id: string;
  user_id: string;
  transcript: string;
  language: string;
  confidence: number;
  intent: string | null;
  parsed_data: Record<string, unknown> | null;
  result_action: string | null;
  result_entity_type: string | null;
  result_entity_id: string | null;
  processing_time_ms: number | null;
  stt_provider: string;
  created_at: string;
}

export interface AiAgentRun {
  id: string;
  user_id: string;
  agent_name: string;
  trigger: 'voice' | 'manual' | 'scheduled' | 'webhook' | 'system';
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  tokens_used: number | null;
  model: string | null;
  created_at: string;
}

export interface AiActionAudit {
  id: string;
  agent_run_id: string;
  user_id: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  input_data: Record<string, unknown> | null;
  output_data: Record<string, unknown> | null;
  was_approved: boolean;
  approved_at: string | null;
  created_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  key: string;
  value: Record<string, unknown> | string | number | boolean;
  category: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Insert types (what you INSERT – omit generated columns)
// ---------------------------------------------------------------------------

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type AreaInsert = Omit<Area, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type GoalInsert = Omit<Goal, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TenderInsert = Omit<Tender, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TaskLogInsert = Omit<TaskLog, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type RecurringTemplateInsert = Omit<RecurringTemplate, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type InboxItemInsert = Omit<InboxItem, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type NoteInsert = Omit<Note, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ActivityLogInsert = Omit<ActivityLog, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type ReviewInsert = Omit<Review, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type FinanceItemInsert = Omit<FinanceItem, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type FinanceCategoryInsert = Omit<FinanceCategory, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type AttachmentInsert = Omit<Attachment, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type TrainingPlanInsert = Omit<TrainingPlan, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type WorkoutSessionInsert = Omit<WorkoutSession, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type VoiceCommandInsert = Omit<VoiceCommand, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type AiAgentRunInsert = Omit<AiAgentRun, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type AiActionAuditInsert = Omit<AiActionAudit, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type UserPreferenceInsert = Omit<UserPreference, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

// ---------------------------------------------------------------------------
// Update types (all fields optional except id)
// ---------------------------------------------------------------------------

export type ProfileUpdate = Partial<Omit<Profile, 'id'>> & { id: string };
export type AreaUpdate = Partial<Omit<Area, 'id'>> & { id: string };
export type GoalUpdate = Partial<Omit<Goal, 'id'>> & { id: string };
export type ProjectUpdate = Partial<Omit<Project, 'id'>> & { id: string };
export type TenderUpdate = Partial<Omit<Tender, 'id'>> & { id: string };
export type TaskUpdate = Partial<Omit<Task, 'id'>> & { id: string };
export type TaskLogUpdate = Partial<Omit<TaskLog, 'id'>> & { id: string };
export type EventUpdate = Partial<Omit<Event, 'id'>> & { id: string };
export type RecurringTemplateUpdate = Partial<Omit<RecurringTemplate, 'id'>> & { id: string };
export type InboxItemUpdate = Partial<Omit<InboxItem, 'id'>> & { id: string };
export type NoteUpdate = Partial<Omit<Note, 'id'>> & { id: string };
export type ReviewUpdate = Partial<Omit<Review, 'id'>> & { id: string };
export type FinanceItemUpdate = Partial<Omit<FinanceItem, 'id'>> & { id: string };
export type FinanceCategoryUpdate = Partial<Omit<FinanceCategory, 'id'>> & { id: string };
export type TrainingPlanUpdate = Partial<Omit<TrainingPlan, 'id'>> & { id: string };
export type WorkoutSessionUpdate = Partial<Omit<WorkoutSession, 'id'>> & { id: string };
export type UserPreferenceUpdate = Partial<Omit<UserPreference, 'id'>> & { id: string };
export type AiAgentRunUpdate = Partial<Omit<AiAgentRun, 'id'>> & { id: string };
export type AiActionAuditUpdate = Partial<Omit<AiActionAudit, 'id'>> & { id: string };

// ---------------------------------------------------------------------------
// Supabase Database type export
// ---------------------------------------------------------------------------

interface TableDefinition<Row, Insert, Update> {
  Row: Row;
  Insert: Insert;
  Update: Update;
}

export interface Database {
  public: {
    Tables: {
      profiles: TableDefinition<Profile, ProfileInsert, ProfileUpdate>;
      areas: TableDefinition<Area, AreaInsert, AreaUpdate>;
      goals: TableDefinition<Goal, GoalInsert, GoalUpdate>;
      projects: TableDefinition<Project, ProjectInsert, ProjectUpdate>;
      tenders: TableDefinition<Tender, TenderInsert, TenderUpdate>;
      tasks: TableDefinition<Task, TaskInsert, TaskUpdate>;
      task_logs: TableDefinition<TaskLog, TaskLogInsert, TaskLogUpdate>;
      events: TableDefinition<Event, EventInsert, EventUpdate>;
      recurring_templates: TableDefinition<RecurringTemplate, RecurringTemplateInsert, RecurringTemplateUpdate>;
      inbox_items: TableDefinition<InboxItem, InboxItemInsert, InboxItemUpdate>;
      notes: TableDefinition<Note, NoteInsert, NoteUpdate>;
      activity_logs: TableDefinition<ActivityLog, ActivityLogInsert, never>;
      reviews: TableDefinition<Review, ReviewInsert, ReviewUpdate>;
      finance_items: TableDefinition<FinanceItem, FinanceItemInsert, FinanceItemUpdate>;
      finance_categories: TableDefinition<FinanceCategory, FinanceCategoryInsert, FinanceCategoryUpdate>;
      attachments: TableDefinition<Attachment, AttachmentInsert, never>;
      training_plans: TableDefinition<TrainingPlan, TrainingPlanInsert, TrainingPlanUpdate>;
      workout_sessions: TableDefinition<WorkoutSession, WorkoutSessionInsert, WorkoutSessionUpdate>;
      voice_commands: TableDefinition<VoiceCommand, VoiceCommandInsert, never>;
      ai_agent_runs: TableDefinition<AiAgentRun, AiAgentRunInsert, AiAgentRunUpdate>;
      ai_action_audit: TableDefinition<AiActionAudit, AiActionAuditInsert, AiActionAuditUpdate>;
      user_preferences: TableDefinition<UserPreference, UserPreferenceInsert, UserPreferenceUpdate>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      area_slug: AreaSlug;
      task_status: TaskStatus;
      task_priority: TaskPriority;
      tender_status: TenderStatus;
      goal_horizon: GoalHorizon;
      review_period: ReviewPeriod;
      finance_status: FinanceStatus;
      finance_type: FinanceType;
      event_type: EventType;
      recurrence_pattern: RecurrencePattern;
    };
  };
}
