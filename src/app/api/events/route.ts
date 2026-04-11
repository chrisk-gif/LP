import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createEventSchema, updateEventSchema } from "@/lib/schemas/event";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("id");
    const start_after = searchParams.get("start_after");
    const start_before = searchParams.get("start_before");
    const area_id = searchParams.get("area_id");

    // Single event lookup by ID (used by deep-link when event is outside loaded range)
    if (eventId) {
      const { data, error } = await supabase
        .from("events")
        .select("*, areas(name, slug, color)")
        .eq("id", eventId)
        .single();
      if (error) return NextResponse.json({ error: "Event not found" }, { status: 404 });
      return NextResponse.json(data);
    }

    let query = supabase
      .from("events")
      .select("*, areas(name, slug, color)")
      .order("start_time", { ascending: true });

    if (start_after) query = query.gte("start_time", start_after);
    if (start_before) query = query.lte("start_time", start_before);
    if (area_id) query = query.eq("area_id", area_id);

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
    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("events")
      .insert({ ...parsed.data, user_id: user.id })
      .select("*, areas(name, slug, color)")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Events POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const parsed = updateEventSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("events")
      .update(parsed.data)
      .eq("id", id)
      .select("*, areas(name, slug, color)")
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Events PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const id = body?.id as string | undefined;
    if (!id || typeof id !== "string") return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Events DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
