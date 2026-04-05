import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const start_after = searchParams.get("start_after");
    const start_before = searchParams.get("start_before");

    let query = supabase
      .from("events")
      .select("*, areas(name, slug, color)")
      .order("start_time", { ascending: true });

    if (start_after) query = query.gte("start_time", start_after);
    if (start_before) query = query.lte("start_time", start_before);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Events GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    if (!body.title || !body.start_time) {
      return NextResponse.json({ error: "Title and start_time are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        ...body,
        user_id: user.id,
        event_type: body.event_type ?? "other",
      })
      .select("*, areas(name, slug, color)")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Events POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
