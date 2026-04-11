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
  | "processing"
  | "executing"
  | "confirming";

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
  const [pendingToolCalls, setPendingToolCalls] = useState<
    Array<{ name: string; input: Record<string, unknown> }> | null
  >(null);

  const [voiceTtsEnabled, setVoiceTtsEnabled] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHasBrowserSpeech(getBrowserSpeechRecognition() !== null);
  }, []);

  // Load voice_tts_enabled preference — same as assistant page
  useEffect(() => {
    async function loadTtsPref() {
      try {
        const res = await fetch("/api/preferences");
        if (res.ok) {
          const data = await res.json();
          setVoiceTtsEnabled(data.voice_tts_enabled === true);
        }
      } catch {
        // Default to false
      }
    }
    loadTtsPref();
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

  // Send transcript to AI command endpoint — same pipeline as assistant page
  const sendToAiCommand = useCallback(
    async (text: string) => {
      setState("executing");
      clearDismissTimer();
      let enteredConfirming = false;
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
          setState("idle");
          scheduleDismiss();
          return;
        }

        const data = (await res.json()) as CommandResponse;

        // If confirmation is required, show confirmation UI instead of auto-executing
        if (data.confirmationRequired && data.toolCalls && data.toolCalls.length > 0) {
          setPendingToolCalls(data.toolCalls);
          setAiResponse(data.response ?? "Bekreft handlingen nedenfor.");
          setAiSuccess(null);
          setState("confirming");
          enteredConfirming = true;
          // Do NOT auto-dismiss while awaiting confirmation — confirmation
          // must remain visible until Bekreft, Avbryt, or explicit user action
          return;
        }

        const responseText = data.response ?? data.error ?? "Ingen respons.";
        setAiResponse(responseText);
        const success = !data.error &&
            (data.actions?.some((a) => a.status === "done") ||
              data.intent !== "unknown");
        setAiSuccess(success);

        // TTS: speak response if enabled — same behavior as assistant page
        if (voiceTtsEnabled && responseText && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(responseText);
          utterance.lang = "nb-NO";
          speechSynthesis.speak(utterance);
        }
      } catch {
        setAiResponse("Kunne ikke koble til AI-tjenesten.");
        setAiSuccess(false);
      } finally {
        // Use local flag instead of stale closure over `state`
        if (!enteredConfirming) {
          setState((prev) => (prev === "confirming" ? prev : "idle"));
          scheduleDismiss();
        }
      }
    },
    [scheduleDismiss, clearDismissTimer, voiceTtsEnabled]
  );

  // Confirm pending tool calls from global mic
  const handleConfirm = useCallback(async () => {
    if (!pendingToolCalls) return;
    setState("executing");
    try {
      const res = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true, pendingToolCalls }),
      });
      const data = (await res.json()) as CommandResponse;
      setAiResponse(data.response ?? "Handlinger utført.");
      setAiSuccess(
        !data.error && (data.actions?.some((a) => a.status === "done") ?? false)
      );
    } catch {
      setAiResponse("Bekreftelse feilet.");
      setAiSuccess(false);
    } finally {
      setPendingToolCalls(null);
      setState("idle");
      scheduleDismiss();
    }
  }, [pendingToolCalls, scheduleDismiss]);

  // Cancel pending confirmation
  const handleCancel = useCallback(() => {
    setPendingToolCalls(null);
    setAiResponse("Handlingen ble avbrutt.");
    setAiSuccess(null);
    setState("idle");
    scheduleDismiss(5000);
  }, [scheduleDismiss]);

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

  // Server-side audio recording fallback is removed.
  // When browser speech recognition is unavailable, we fail immediately
  // and honestly — no fake recording → upload → 422 cycle.

  // ---- Click handler ----
  function handleClick() {
    if (state === "listening") {
      stopBrowserSpeech();
      return;
    }
    if (state === "confirming") {
      // Clicking mic while confirming = cancel
      handleCancel();
      return;
    }
    if (state !== "idle") return;

    if (hasBrowserSpeech) {
      startBrowserSpeech();
    } else {
      // No browser speech recognition available — fail immediately and honestly
      // Do NOT start recording and upload to a dead server STT path
      setTranscript(
        "Talegjenkjenning er ikke tilgjengelig i denne nettleseren. Bruk Chrome eller Edge."
      );
      setAiSuccess(false);
      scheduleDismiss(8000);
    }
  }

  const isActive = state === "listening";
  const isBusy = state === "processing" || state === "executing";
  const isConfirming = state === "confirming";

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={isBusy}
            className={cn("relative", (isActive || isConfirming) && "text-destructive")}
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
                  : isConfirming
                    ? "Avbryt bekreftelse"
                    : "Start talekommando"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isActive
            ? "Klikk for å stoppe"
            : isBusy
              ? "Behandler tale..."
              : isConfirming
                ? "Avbryt"
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
          {/* Confirmation buttons — same semantics as assistant page */}
          {isConfirming && pendingToolCalls && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
              >
                Bekreft
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
              >
                Avbryt
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
