"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
  actions?: Array<{ action: string; status: string }>;
  isVoice?: boolean;
}

const exampleCommands = [
  "Hva er viktigst i dag?",
  "Legg inn møte med byggherre onsdag klokken 14",
  "Gi meg status på aktive tilbud",
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
        "Hei! Jeg er din personlige assistent. Jeg kan hjelpe deg med oppgaver, kalender, tilbud, økonomi, trening og mer. Hva kan jeg hjelpe deg med?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userMessage.content }),
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
      };

      setMessages((prev) => [...prev, assistantMessage]);
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
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording is handled by the VoiceRecorder component
    // This is a simplified toggle for the assistant page
    if (!isRecording) {
      // Start recording - integrate with voice system
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "system",
          content: "Lytter... Snakk nå.",
          timestamp: new Date(),
        },
      ]);
    }
  };

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
                      {message.confidence && (
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
                          {action.action}
                        </div>
                      ))}
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
          {isLoading && (
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

      {/* Input area */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          onClick={toggleRecording}
          title={isRecording ? "Stopp opptak" : "Start stemmekommando"}
        >
          {isRecording ? (
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
