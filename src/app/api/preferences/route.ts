import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data } = await supabase
      .from("user_preferences")
      .select("voice_tts_enabled, ai_auto_execute, theme")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json(data ?? { voice_tts_enabled: false, ai_auto_execute: false, theme: "system" });
  } catch {
    return NextResponse.json(
      { error: "Failed to load preferences" },
      { status: 500 }
    );
  }
}
