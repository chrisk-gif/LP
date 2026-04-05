import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface WorkoutSessionInput {
  title: string;
  plan_id?: string;
  session_type?: string;
  planned_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  intensity?: string;
  notes?: string;
  metrics?: Record<string, unknown>;
}

export interface TrainingPlanInput {
  title: string;
  description?: string;
  goal_id?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export async function getWorkoutSessions(filters?: {
  plan_id?: string;
  completed?: boolean;
  limit?: number;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("workout_sessions")
    .select("*, training_plans(title)")
    .order("planned_at", { ascending: false });

  if (filters?.plan_id) query = query.eq("plan_id", filters.plan_id);
  if (filters?.completed === true)
    query = query.not("completed_at", "is", null);
  if (filters?.completed === false)
    query = query.is("completed_at", null);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getRecentWorkouts(days = 28) {
  const start = new Date(Date.now() - days * 86400000).toISOString();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .not("completed_at", "is", null)
    .gte("completed_at", start)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function logWorkout(input: WorkoutSessionInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({
      ...input,
      user_id: user.id,
      completed_at: input.completed_at ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTrainingPlans() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("training_plans")
    .select("*, goals(title)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTrainingPlan(input: TrainingPlanInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("training_plans")
    .insert({
      ...input,
      user_id: user.id,
      status: input.status ?? "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
