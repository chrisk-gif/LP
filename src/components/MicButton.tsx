"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Loader2 } from "lucide-react";

type RecordingState = "idle" | "recording" | "processing";

export function MicButton() {
  const [state, setState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setState("processing");

        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");

          const response = await fetch("/api/voice", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            setTranscript(data.transcript ?? "Ingen tekst gjenkjent.");
          } else {
            setTranscript("Feil ved transkribering.");
          }
        } catch {
          setTranscript("Kunne ikke koble til talegjenkjenning.");
        } finally {
          setState("idle");
          // Auto-clear transcript after 5 seconds
          setTimeout(() => setTranscript(null), 5000);
        }
      };

      mediaRecorder.start();
      setState("recording");
      setTranscript(null);
    } catch {
      console.error("Mikrofon ikke tilgjengelig");
      setState("idle");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  function handleClick() {
    if (state === "recording") {
      stopRecording();
    } else if (state === "idle") {
      startRecording();
    }
  }

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={state === "processing"}
            className={cn(
              "relative",
              state === "recording" && "text-destructive"
            )}
          >
            {state === "processing" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : state === "recording" ? (
              <>
                <MicOff className="h-4 w-4" />
                {/* Pulsing ring */}
                <span className="absolute inset-0 rounded-md animate-ping bg-destructive/20" />
              </>
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span className="sr-only">
              {state === "recording"
                ? "Stopp opptak"
                : state === "processing"
                  ? "Behandler..."
                  : "Start talekommando"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {state === "recording"
            ? "Klikk for å stoppe"
            : state === "processing"
              ? "Behandler tale..."
              : "Talekommando"}
        </TooltipContent>
      </Tooltip>

      {/* Transcript popup */}
      {transcript && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-md border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Transkripsjon:
          </p>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}
