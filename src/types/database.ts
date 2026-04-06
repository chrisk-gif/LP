// =============================================================================
// Livsplanlegg – Database Types
// Aligned with SQL schema in supabase/migrations/00001_initial_schema.sql
// =============================================================================

// ---------------------------------------------------------------------------
// Enums (must match SQL exactly)
// ---------------------------------------------------------------------------

export type AreaSlug =
  | 'asplan-viak'
  | 'ytly'
  | 'privat'
  | 'okonomi'
  | 'trening';

export type TaskStatus =
  | 'inbox'
  | 'todo'
  | 'in_progress'
  | 'waiting'
  | 'done'
  | 'archived';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type TenderStatus =
  | 'identified'
  | 'preparing'
  | 'submitted'
  | 'won'
  | 'lost'
  | 'cancelled';

export type GoalHorizon = 'short-term' | 'monthly' | 'quarterly' | 'yearly' | 'long-term';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export type ProjectStatus = 'active' | 'backlog' | 'completed' | 'archived';

export type ReviewPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export type FinanceStatus = 'upcoming' | 'due' | 'overdue' | 'paid' | 'archived';

export type FinanceType = 'bill' | 'subscription' | 'receipt' | 'reimbursement' | 'savings' | 'investment' | 'other';

export type EventType =
  | 'meeting'
  | 'deadline'
  | 'reminder'
  | 'block'
  | 'personal'
  | 'other';

export type EnergyLevel = 'high' | 'medium' | 'low';

export type TaskSource = 'manual' | 'ai' | 'voice' | 'recurring' | 'import';

export type RecurringEntityType = 'task' | 'event' | 'finance';

export type InboxItemType = 'task' | 'idea' | 'note' | 'bill' | 'event' | 'training' | 'voice_memo';

export type InboxSource = 'manual' | 'voice' | 'ai';

export type TrainingStatus = 'active' | 'completed' | 'paused';

export type WorkoutIntensity = 'easy' | 'moderate' | 'hard' | 'max';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type SensitivityLevel = 'normal' | 'confidential' | 'restricted';

// ---------------------------------------------------------------------------
// Row types (what you SELECT from the DB)
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  locale: string;
  timezone: string;
  currency: string;
  preferences: Record<string, unknown>;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Area {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  color: string | null;
  icon: string | null;
  sort_order: number;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  area_id: string;
  title: string;
  description: string | null;
  horizon: GoalHorizon;
  status: GoalStatus;
  target_date: string | null;
  measurable_metric: string | null;
  current_progress: number;
  why_it_matters: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  area_id: string;
  goal_id: string | null;
  title: string;
  description: string | null;
  type: string | null;
  status: ProjectStatus;
  priority: TaskPriority;
  start_date: string | null;
  due_date: string | null;
  progress: number;
  notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tender {
  id: string;
  user_id: string;
  area_id: string;
  project_id: string | null;
  title: string;
  client: string | null;
  due_date: string | null;
  status: TenderStatus;
  probability: number | null;
  risk_level: RiskLevel | null;
  next_milestone: string | null;
  submitted_at: string | null;
  won_lost_status: string | null;
  lessons_learned: string | null;
  sensitivity: SensitivityLevel;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  area_id: string;
  project_id: string | null;
  goal_id: string | null;
  tender_id: string | null;
  event_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  energy_level: EnergyLevel | null;
  due_date: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  estimated_minutes: number | null;
  recurrence_pattern: string | null;
  tags: string[];
  source: TaskSource;
  created_by_ai: boolean;
  ai_confidence: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TaskLog {
  id: string;
  task_id: string;
  user_id: string;
  content: string | null;
  type: 'comment' | 'status_change' | 'update';
  created_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  area_id: string;
  project_id: string | null;
  tender_id: string | null;
  title: string;
  description: string | null;
  event_type: EventType;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location: string | null;
  recurrence_pattern: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecurringTemplate {
  id: string;
  user_id: string;
  entity_type: RecurringEntityType;
  template_data: Record<string, unknown>;
  recurrence_rule: string;
  next_occurrence: string | null;
  last_generated: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InboxItem {
  id: string;
  user_id: string;
  content: string;
  item_type: InboxItemType | null;
  area_id: string | null;
  processed: boolean;
  processed_at: string | null;
  source: InboxSource;
  raw_transcript: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  area_id: string | null;
  project_id: string | null;
  tender_id: string | null;
  title: string;
  content: string | null;
  pinned: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
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
  blockers: string | null;
  lessons_learned: string | null;
  next_focus: string | null;
  freeform_notes: string | null;
  metrics_snapshot: Record<string, unknown>;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: FinanceType;
  status: FinanceStatus;
  amount: number | null;
  currency: string;
  vendor: string | null;
  category: string | null;
  due_date: string | null;
  paid_date: string | null;
  recurrence_pattern: string | null;
  reminder_days_before: number;
  notes: string | null;
  attachment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceCategory {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  created_at: string;
}

export interface Attachment {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  bucket: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
}

export interface TrainingPlan {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_id: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TrainingStatus;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  plan_id: string | null;
  title: string;
  session_type: string | null;
  planned_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  intensity: WorkoutIntensity | null;
  notes: string | null;
  metrics: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface VoiceCommand {
  id: string;
  user_id: string;
  raw_transcript: string | null;
  normalized_transcript: string | null;
  detected_intent: string | null;
  confidence: number | null;
  executed_actions: Record<string, unknown>[];
  result: string | null;
  audio_file_path: string | null;
  language: string;
  created_at: string;
}

export interface AiAgentRun {
  id: string;
  user_id: string;
  agent_name: string;
  input_text: string | null;
  output_text: string | null;
  model_used: string | null;
  tokens_used: number | null;
  duration_ms: number | null;
  success: boolean;
  error: string | null;
  created_at: string;
}

export interface AiActionAudit {
  id: string;
  user_id: string;
  agent_name: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  confidence: number | null;
  auto_executed: boolean;
  confirmed_by_user: boolean;
  undone: boolean;
  created_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  working_hours: Record<string, unknown>;
  planning_style: string | null;
  review_cadence: Record<string, unknown>;
  finance_reminder_defaults: Record<string, unknown>;
  training_defaults: Record<string, unknown>;
  ai_auto_execute: boolean;
  voice_tts_enabled: boolean;
  theme: string;
  dashboard_widgets: string[];
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Insert types (omit generated columns)
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

export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type InboxItemInsert = Omit<InboxItem, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type NoteInsert = Omit<Note, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
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
export type EventUpdate = Partial<Omit<Event, 'id'>> & { id: string };
export type InboxItemUpdate = Partial<Omit<InboxItem, 'id'>> & { id: string };
export type NoteUpdate = Partial<Omit<Note, 'id'>> & { id: string };
export type ReviewUpdate = Partial<Omit<Review, 'id'>> & { id: string };
export type FinanceItemUpdate = Partial<Omit<FinanceItem, 'id'>> & { id: string };
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
      task_logs: TableDefinition<TaskLog, never, never>;
      events: TableDefinition<Event, EventInsert, EventUpdate>;
      recurring_templates: TableDefinition<RecurringTemplate, never, never>;
      inbox_items: TableDefinition<InboxItem, InboxItemInsert, InboxItemUpdate>;
      notes: TableDefinition<Note, NoteInsert, NoteUpdate>;
      reviews: TableDefinition<Review, ReviewInsert, ReviewUpdate>;
      finance_items: TableDefinition<FinanceItem, FinanceItemInsert, FinanceItemUpdate>;
      finance_categories: TableDefinition<FinanceCategory, never, never>;
      attachments: TableDefinition<Attachment, never, never>;
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
      task_status: TaskStatus;
      priority_level: TaskPriority;
      tender_status: TenderStatus;
      goal_horizon: GoalHorizon;
      goal_status: GoalStatus;
      project_status: ProjectStatus;
      review_period: ReviewPeriod;
      finance_status: FinanceStatus;
      finance_type: FinanceType;
      event_type: EventType;
      energy_level: EnergyLevel;
      task_source: TaskSource;
      training_status: TrainingStatus;
      workout_intensity: WorkoutIntensity;
      risk_level: RiskLevel;
      sensitivity_level: SensitivityLevel;
    };
  };
}
