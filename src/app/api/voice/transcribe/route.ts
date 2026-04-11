import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { voiceLimiter } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 15 requests/minute per user
    const rateCheck = voiceLimiter.check(user.id);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "For mange taleforespørsler. Vent litt." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const browserTranscript = formData.get("transcript") as string | null;

    // If browser already provided a transcript, use it directly
    if (browserTranscript) {
      // Log the voice command (best-effort)
      try {
        await supabase.from("voice_commands").insert({
          user_id: user.id,
          raw_transcript: browserTranscript,
          normalized_transcript: browserTranscript,
          language: "nb-NO",
        });
      } catch {
        // Voice logging is best-effort
      }

      return NextResponse.json({
        transcript: browserTranscript,
        source: "browser",
      });
    }

    // Fallback: upload audio file and use server-side transcription
    if (!audioFile) {
      return NextResponse.json(
        { error: "Ingen lydfil eller transkripsjon mottatt." },
        { status: 400 }
      );
    }

    // Upload audio to Supabase storage for audit (user-scoped path)
    const fileName = `${user.id}/voice-${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from("voice-audio")
      .upload(fileName, audioFile, {
        contentType: audioFile.type,
      });

    if (uploadError) {
      console.error("Audio upload error:", uploadError);
      // Non-fatal: continue even if storage upload fails
    }

    // STT provider abstraction
    const sttProvider = process.env.STT_PROVIDER ?? "browser";

    if (sttProvider === "browser") {
      // No server-side transcription available
      return NextResponse.json(
        {
          error:
            "Talegjenkjenning p\u00e5 server er ikke konfigurert. Bruk en nettleser med innebygd talegjenkjenning (Chrome, Edge).",
          source: "none",
        },
        { status: 422 }
      );
    }

    // Future: implement OpenAI Whisper or other STT provider
    // const transcript = await transcribeWithProvider(audioFile, sttProvider);

    return NextResponse.json(
      {
        error: `STT-leverand\u00f8r ikke implementert: ${sttProvider}`,
        source: "none",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Voice transcription error:", error);
    return NextResponse.json(
      { error: "Intern serverfeil ved talebehandling." },
      { status: 500 }
    );
  }
}
