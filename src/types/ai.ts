// =============================================================================
// Livsplanlegg – AI System Types
// =============================================================================

export type AgentName =
  | 'planner'
  | 'inbox_processor'
  | 'task_manager'
  | 'calendar_assistant'
  | 'finance_assistant'
  | 'training_coach'
  | 'tender_assistant'
  | 'review_generator'
  | 'voice_handler'
  | 'general';

export type Intent =
  | 'create_task'
  | 'update_task'
  | 'complete_task'
  | 'delete_task'
  | 'create_event'
  | 'update_event'
  | 'delete_event'
  | 'create_note'
  | 'create_goal'
  | 'update_goal'
  | 'log_finance'
  | 'log_workout'
  | 'start_review'
  | 'query_schedule'
  | 'query_tasks'
  | 'query_finances'
  | 'query_training'
  | 'process_inbox'
  | 'create_tender'
  | 'update_tender'
  | 'move_task'
  | 'reschedule_event'
  | 'summarize'
  | 'unknown';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ParsedCommand {
  raw_input: string;
  intent: Intent;
  confidence: number; // 0.0 – 1.0
  confidence_level: ConfidenceLevel;
  entities: ParsedEntities;
  context: CommandContext;
  requires_confirmation: boolean;
  ambiguities: string[];
}

export interface ParsedEntities {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  duration_minutes?: number;
  area?: string;
  project?: string;
  priority?: string;
  status?: string;
  amount?: number;
  currency?: string;
  tags?: string[];
  person?: string;
  location?: string;
  [key: string]: unknown;
}

export interface CommandContext {
  source: 'voice' | 'text' | 'api';
  language: string;
  timestamp: string;
  user_id: string;
  current_area?: string;
  current_view?: string;
  previous_intent?: Intent;
}

export interface AgentRun {
  id: string;
  agent_name: AgentName;
  trigger: 'voice' | 'manual' | 'scheduled' | 'webhook' | 'system';
  input: Record<string, unknown>;
  output: AgentRunOutput | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  tokens_used: number | null;
  model: string | null;
  actions: ActionAudit[];
}

export interface AgentRunOutput {
  message: string;
  entities_created: EntityReference[];
  entities_updated: EntityReference[];
  suggestions: string[];
  follow_up_actions: FollowUpAction[];
  [key: string]: unknown;
}

export interface EntityReference {
  entity_type: string;
  entity_id: string;
  title?: string;
}

export interface FollowUpAction {
  intent: Intent;
  description: string;
  auto_execute: boolean;
  parameters: Record<string, unknown>;
}

export interface ActionAudit {
  id: string;
  agent_run_id: string;
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

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  required_permissions: string[];
  requires_confirmation: boolean;
  agent: AgentName;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  description: string;
  required: boolean;
  enum_values?: string[];
  default_value?: unknown;
}

export interface ToolResult {
  tool_name: string;
  success: boolean;
  data: Record<string, unknown> | null;
  error: string | null;
  execution_time_ms: number;
  entities_affected: EntityReference[];
}
