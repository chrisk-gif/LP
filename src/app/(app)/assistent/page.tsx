"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  Mic,
  MicOff,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { useVoice } from "@/hooks/useVoice";

interface ToolCall {
  name: string;
  input: Record<string, unknown>;
}

interface ActionInfo {
  action: string;
  status: string;
  message?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
  actions?: ActionInfo[];
  isVoice?: boolean;
  confirmationRequired?: boolean;
  toolCalls?: ToolCall[];
}

const exampleCommands = [
  "Hva er viktigst i dag?",
  "Legg inn mote med byggherre onsdag klokken 14",
  "Gi meg status pa aktive tilbud",
  "Lag en oppgave: ferdigstille prismatrise innen fredag",
  "Marker faktura fra Hafslund som betalt",
  "Jeg trente styrke i 45 minutter i dag",
  "Planlegg uka mi",
  "Oppsummer siste ukes fremgang",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hei! Jeg er din personlige assistent. Jeg kan hjelpe deg med oppgaver, kalender, tilbud, okonomi, trening og mer. Hva kan jeg hjelpe deg med?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    messageId: string;
    toolCalls: ToolCall[];
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const voice = useVoice();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When voice transcript completes, send it as input
  useEffect(() => {
    if (voice.transcript && !voice.isListening) {
      setInput(voice.transcript);
      voice.reset();
    }
  }, [voice.isListening, voice.transcript, voice.reset]);

  const sendCommand = useCallback(
    async (text: string, isVoice = false) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = {
        id: String(Date.now()),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
        isVoice,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/ai/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: text.trim() }),
        });

        if (!response.ok) throw new Error("Feil ved AI-forespørsel");

        const data = await response.json();

        const assistantMessage: Message = {
          id: String(Date.now() + 1),
          role: "assistant",
          content: data.response || data.explanation || "Utført.",
          timestamp: new Date(),
          intent: data.intent,
          confidence: data.confidence,
          actions: data.actions,
          confirmationRequired: data.confirmationRequired,
          toolCalls: data.toolCalls,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // If confirmation is required and there are pending tool calls
        if (
          data.confirmationRequired &&
          data.toolCalls &&
          data.toolCalls.length > 0
        ) {
          setPendingConfirmation({
            messageId: assistantMessage.id,
            toolCalls: data.toolCalls,
          });
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: "assistant",
            content:
              "Beklager, jeg kunne ikke behandle forespørselen. Prøv igjen eller sjekk at API-nøkkelen er konfigurert.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const handleSend = () => {
    sendCommand(input);
  };

  const handleConfirm = async () => {
    if (!pendingConfirmation || isLoading) return;
    setIsLoading(true);
    const { toolCalls } = pendingConfirmation;
    setPendingConfirmation(null);

    try {
      const response = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm: true,
          pendingToolCalls: toolCalls,
        }),
      });

      if (!response.ok) throw new Error("Feil ved bekreftelse");

      const data = await response.json();

      const resultMessage: Message = {
        id: String(Date.now()),
        role: "assistant",
        content: data.response || "Handlinger utført.",
        timestamp: new Date(),
        intent: data.intent,
        confidence: data.confidence,
        actions: data.actions,
      };

      setMessages((prev) => [...prev, resultMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "assistant",
          content: "Beklager, bekreftelsen feilet. Prøv igjen.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPendingConfirmation(null);
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        role: "system",
        content: "Handlingen ble avbrutt.",
        timestamp: new Date(),
      },
    ]);
  };

  const toggleVoice = () => {
    if (!voice.capabilities.speechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "system",
          content:
            "Talegjenkjenning er ikke tilgjengelig i denne nettleseren. Bruk Chrome eller Edge for stemmekommandoer.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.reset();
      voice.startListening();
    }
  };

  function formatToolCallDescription(tc: ToolCall): string {
    const labels: Record<string, string> = {
      create_task: "Opprett oppgave",
      create_event: "Opprett hendelse",
      complete_task: "Fullfør oppgave",
      create_finance_item: "Opprett finanspost",
      mark_paid: "Merk som betalt",
      log_workout: "Logg trening",
      create_note: "Opprett notat",
      query_data: "Hent data",
      reschedule: "Flytt",
    };
    const label = labels[tc.name] ?? tc.name;
    const title =
      (tc.input.title as string) ??
      (tc.input.task_title_search as string) ??
      (tc.input.search_term as string) ??
      "";
    return title ? `${label}: ${title}` : label;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Assistent</h1>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <Card
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.role === "system"
                      ? "bg-muted"
                      : ""
                }`}
              >
                <CardContent className="py-3 px-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  {message.intent && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {message.intent}
                      </Badge>
                      {message.confidence != null && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(message.confidence * 100)}% sikkerhet
                        </span>
                      )}
                    </div>
                  )}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.actions.map((action, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 text-xs"
                        >
                          {action.status === "done" ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                          )}
                          <span>{action.message ?? action.action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Pending confirmation indicator */}
                  {message.confirmationRequired &&
                    message.toolCalls &&
                    message.toolCalls.length > 0 &&
                    pendingConfirmation?.messageId === message.id && (
                      <div className="mt-3 p-3 rounded-md border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Bekreftelse kreves
                          </span>
                        </div>
                        <div className="space-y-1 mb-3">
                          {message.toolCalls.map((tc, i) => (
                            <div
                              key={i}
                              className="text-xs text-yellow-700 dark:text-yellow-300"
                            >
                              {formatToolCallDescription(tc)}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="gap-1"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            Bekreft
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Avbryt
                          </Button>
                        </div>
                      </div>
                    )}
                  <span className="text-xs opacity-50 mt-1 block">
                    {message.timestamp.toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </CardContent>
              </Card>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && !pendingConfirmation && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <Card>
                <CardContent className="py-3 px-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Example commands */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Prøv disse kommandoene:
          </p>
          <div className="flex flex-wrap gap-2">
            {exampleCommands.map((cmd, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInput(cmd)}
              >
                {cmd}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Voice status */}
      {voice.isListening && (
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          {voice.interimTranscript
            ? `Hører: ${voice.interimTranscript}`
            : "Lytter... Snakk nå."}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          variant={voice.isListening ? "destructive" : "outline"}
          size="icon"
          onClick={toggleVoice}
          title={
            !voice.capabilities.speechRecognition
              ? "Talegjenkjenning ikke tilgjengelig i denne nettleseren"
              : voice.isListening
                ? "Stopp opptak"
                : "Start stemmekommando"
          }
        >
          {voice.isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
        <Input
          ref={inputRef}
          placeholder="Skriv en kommando eller still et spørsmål..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
