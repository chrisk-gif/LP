"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Loader2, CheckCircle2, XCircle } from "lucide-react";

type PipelineState =
  | "idle"
  | "listening"
  | "recording"
  | "processing"
  | "executing";

interface CommandResponse {
  intent?: string;
  confidence?: number;
  response?: string;
  actions?: Array<{
    action: string;
    status: string;
    entityId?: string;
    message?: string;
  }>;
  confirmationRequired?: boolean;
  toolCalls?: Array<{ name: string; input: Record<string, unknown> }>;
  error?: string;
}

// Check if browser SpeechRecognition is available
function getBrowserSpeechRecognition(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const SR =
    (window as unknown as Record<string, unknown>).SpeechRecognition ??
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
  return (SR as (new () => SpeechRecognition) | undefined) ?? null;
}

export function MicButton() {
  const [state, setState] = useState<PipelineState>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<boolean | null>(null);
  const [hasBrowserSpeech, setHasBrowserSpeech] = useState<boolean>(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHasBrowserSpeech(getBrowserSpeechRecognition() !== null);
  }, []);

  // Clear any pending dismiss timer
  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  // Auto-dismiss results after delay
  const scheduleDismiss = useCallback(
    (delayMs: number = 8000) => {
      clearDismissTimer();
      dismissTimerRef.current = setTimeout(() => {
        setTranscript(null);
        setAiResponse(null);
        setAiSuccess(null);
      }, delayMs);
    },
    [clearDismissTimer]
  );

  // Send transcript to AI command endpoint
  const sendToAiCommand = useCallback(
    async (text: string) => {
      setState("executing");
      try {
        const res = await fetch("/api/ai/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: text }),
        });

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as Record<
            string,
            unknown
          >;
          setAiResponse(
            (errData.response as string) ??
              (errData.error as string) ??
              "Feil ved behandling av kommando."
          );
          setAiSuccess(false);
          return;
        }

        const data = (await res.json()) as CommandResponse;
        setAiResponse(data.response ?? data.error ?? "Ingen respons.");
        setAiSuccess(
          !data.error &&
            (data.actions?.some((a) => a.status === "done") ||
              data.intent !== "unknown")
        );
      } catch {
        setAiResponse("Kunne ikke koble til AI-tjenesten.");
        setAiSuccess(false);
      } finally {
        setState("idle");
        scheduleDismiss();
      }
    },
    [scheduleDismiss]
  );

  // ---- Browser Speech Recognition path ----
  const startBrowserSpeech = useCallback(() => {
    const SRClass = getBrowserSpeechRecognition();
    if (!SRClass) return;

    const recognition = new SRClass();
    recognition.lang = "nb-NO";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      if (text) {
        setTranscript(text);
        sendToAiCommand(text);
      } else {
        setTranscript("Ingen tale gjenkjent.");
        setState("idle");
        scheduleDismiss(5000);
      }
    };

    recognition.onerror = () => {
      setTranscript("Feil ved talegjenkjenning.");
      setState("idle");
      scheduleDismiss(5000);
    };

    recognition.onend = () => {
      // If we are still in listening state it means no result came
      setState((prev) => (prev === "listening" ? "idle" : prev));
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState("listening");
    setTranscript(null);
    setAiResponse(null);
    setAiSuccess(null);
    clearDismissTimer();
  }, [sendToAiCommand, scheduleDismiss, clearDismissTimer]);

  const stopBrowserSpeech = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  // ---- Fallback: audio recording + server transcribe ----
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
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setState("processing");

        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");

          const response = await fetch("/api/voice/transcribe", {
            method: "POST",
            body: formData,
          });

          if (response.status === 422) {
            // No STT configured on server
            setTranscript(
              "Talegjenkjenning er ikke konfigurert p\u00e5 serveren. Bruk en nettleser med innebygd talegjenkjenning (Chrome, Edge)."
            );
            setState("idle");
            scheduleDismiss(8000);
            return;
          }

          if (!response.ok) {
            setTranscript("Feil ved transkribering.");
            setState("idle");
            scheduleDismiss(5000);
            return;
          }

          const data = (await response.json()) as {
            transcript?: string;
          };
          const text = data.transcript;

          if (text) {
            setTranscript(text);
            // Route through AI command
            await sendToAiCommand(text);
          } else {
            setTranscript("Ingen tekst gjenkjent.");
            setState("idle");
            scheduleDismiss(5000);
          }
        } catch {
          setTranscript("Kunne ikke koble til talegjenkjenning.");
          setState("idle");
          scheduleDismiss(5000);
        }
      };

      mediaRecorder.start();
      setState("recording");
      setTranscript(null);
      setAiResponse(null);
      setAiSuccess(null);
      clearDismissTimer();
    } catch {
      console.error("Mikrofon ikke tilgjengelig");
      setState("idle");
    }
  }, [sendToAiCommand, scheduleDismiss, clearDismissTimer]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ---- Click handler ----
  function handleClick() {
    if (state === "listening") {
      stopBrowserSpeech();
      return;
    }
    if (state === "recording") {
      stopRecording();
      return;
    }
    if (state !== "idle") return;

    if (hasBrowserSpeech) {
      startBrowserSpeech();
    } else {
      startRecording();
    }
  }

  const isActive = state === "listening" || state === "recording";
  const isBusy = state === "processing" || state === "executing";

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={isBusy}
            className={cn("relative", isActive && "text-destructive")}
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isActive ? (
              <>
                <MicOff className="h-4 w-4" />
                {/* Pulsing ring */}
                <span className="absolute inset-0 rounded-md animate-ping bg-destructive/20" />
              </>
            ) : (
              <Mic className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isActive
                ? "Stopp opptak"
                : isBusy
                  ? "Behandler..."
                  : "Start talekommando"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isActive
            ? "Klikk for \u00e5 stoppe"
            : isBusy
              ? "Behandler tale..."
              : "Talekommando"}
        </TooltipContent>
      </Tooltip>

      {/* Result popup */}
      {(transcript || aiResponse) && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-md border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md space-y-2">
          {transcript && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-0.5">
                Transkripsjon:
              </p>
              <p>{transcript}</p>
            </div>
          )}
          {aiResponse && (
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {aiSuccess === true && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                )}
                {aiSuccess === false && (
                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                )}
                <p className="text-xs font-medium text-muted-foreground">
                  AI-respons:
                </p>
              </div>
              <p>{aiResponse}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
