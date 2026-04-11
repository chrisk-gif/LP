"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface VoiceCapabilities {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  mediaRecorder: boolean;
}

export interface UseVoiceReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  capabilities: VoiceCapabilities;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  cancelSpeech: () => void;
  reset: () => void;
}

function getSpeechRecognitionConstructor(): (new () => any) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [capabilities, setCapabilities] = useState<VoiceCapabilities>({
    speechRecognition: false,
    speechSynthesis: false,
    mediaRecorder: false,
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setCapabilities({
      speechRecognition: !!getSpeechRecognitionConstructor(),
      speechSynthesis:
        typeof window !== "undefined" && "speechSynthesis" in window,
      mediaRecorder:
        typeof window !== "undefined" && "MediaRecorder" in window,
    });
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionAPI) {
      console.warn("SpeechRecognition not available");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "nb-NO";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) =>
          prev ? prev + " " + finalTranscript : finalTranscript
        );
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nb-NO";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = speechSynthesis.getVoices();
    const nbVoice = voices.find(
      (v) => v.lang.startsWith("nb") || v.lang.startsWith("no")
    );
    if (nbVoice) utterance.voice = nbVoice;

    speechSynthesis.speak(utterance);
  }, []);

  const cancelSpeech = useCallback(() => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    stopListening();
    cancelSpeech();
  }, [stopListening, cancelSpeech]);

  return {
    isListening,
    transcript,
    interimTranscript,
    capabilities,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    reset,
  };
}
