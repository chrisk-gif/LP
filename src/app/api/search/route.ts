import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const q = request.nextUrl.searchParams.get("q")?.trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ tasks: [], events: [], projects: [], notes: [] });
    }

    const pattern = `%${q}%`;

    const [tasksRes, eventsRes, projectsRes, notesRes] = await Promise.all([
      supabase
        .from("tasks")
        .select("id, title, status, priority, due_date")
        .ilike("title", pattern)
        .neq("status", "archived")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("events")
        .select("id, title, event_type, start_time")
        .ilike("title", pattern)
        .order("start_time", { ascending: false })
        .limit(5),
      supabase
        .from("projects")
        .select("id, title, status")
        .ilike("title", pattern)
        .neq("status", "archived")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("notes")
        .select("id, title, updated_at")
        .ilike("title", pattern)
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

    return NextResponse.json({
      tasks: tasksRes.data ?? [],
      events: eventsRes.data ?? [],
      projects: projectsRes.data ?? [],
      notes: notesRes.data ?? [],
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
