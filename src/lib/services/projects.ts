import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ProjectInput {
  title: string;
  description?: string;
  area_id?: string;
  goal_id?: string;
  type?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  due_date?: string;
  progress?: number;
  notes?: string;
}

export async function getProjects(filters?: {
  area_id?: string;
  status?: string;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("projects")
    .select("*, areas(name, slug, color), goals(title)")
    .order("created_at", { ascending: false });

  if (filters?.area_id) query = query.eq("area_id", filters.area_id);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getActiveProjects() {
  return getProjects({ status: "active" });
}

export async function createProject(input: ProjectInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...input,
      user_id: user.id,
      status: input.status ?? "active",
      priority: input.priority ?? "medium",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(
  id: string,
  updates: Partial<ProjectInput>
) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
