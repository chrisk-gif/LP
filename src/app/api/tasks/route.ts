import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const area_id = searchParams.get("area_id");
    const scheduled_date = searchParams.get("scheduled_date");

    let query = supabase
      .from("tasks")
      .select("*, areas(name, slug, color)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (area_id) query = query.eq("area_id", area_id);
    if (scheduled_date) query = query.eq("scheduled_date", scheduled_date);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Tasks GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, description, area_id, priority, due_date, scheduled_date, scheduled_time, estimated_minutes, status: taskStatus, source, tags } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title,
        description,
        area_id,
        priority: priority ?? "medium",
        due_date,
        scheduled_date,
        scheduled_time,
        estimated_minutes,
        status: taskStatus ?? "todo",
        source: source ?? "manual",
        tags,
      })
      .select("*, areas(name, slug, color)")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Tasks POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
