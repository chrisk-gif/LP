import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const browserTranscript = formData.get("transcript") as string | null;

    // If browser already provided a transcript, use it directly
    if (browserTranscript) {
      // Log the voice command
      await supabase.from("voice_commands").insert({
        user_id: user.id,
        raw_transcript: browserTranscript,
        normalized_transcript: browserTranscript,
        language: "nb-NO",
      });

      return NextResponse.json({
        transcript: browserTranscript,
        source: "browser",
      });
    }

    // Fallback: upload audio file and use server-side transcription
    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file or transcript provided" },
        { status: 400 }
      );
    }

    // Upload audio to Supabase storage for audit
    const fileName = `voice-${user.id}-${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from("voice-audio")
      .upload(fileName, audioFile, {
        contentType: audioFile.type,
      });

    if (uploadError) {
      console.error("Audio upload error:", uploadError);
    }

    // STT provider abstraction
    const sttProvider = process.env.STT_PROVIDER ?? "browser";

    if (sttProvider === "browser") {
      // No server-side transcription available
      return NextResponse.json(
        {
          error: "Server-side transcription not configured. Use browser speech recognition.",
          source: "none",
        },
        { status: 422 }
      );
    }

    // Future: implement OpenAI Whisper or other STT provider
    // const transcript = await transcribeWithProvider(audioFile, sttProvider);

    return NextResponse.json(
      {
        error: "STT provider not implemented: " + sttProvider,
        source: "none",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Voice transcription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
