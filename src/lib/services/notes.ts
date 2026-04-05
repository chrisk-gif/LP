import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface NoteInput {
  title: string;
  content?: string;
  area_id?: string;
  project_id?: string;
  tender_id?: string;
  pinned?: boolean;
  tags?: string[];
}

export async function getNotes(filters?: {
  area_id?: string;
  pinned?: boolean;
  limit?: number;
}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("notes")
    .select("*, areas(name, slug, color)")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (filters?.area_id) query = query.eq("area_id", filters.area_id);
  if (filters?.pinned !== undefined) query = query.eq("pinned", filters.pinned);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createNote(input: NoteInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("notes")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNote(id: string, updates: Partial<NoteInput>) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("notes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNote(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}
