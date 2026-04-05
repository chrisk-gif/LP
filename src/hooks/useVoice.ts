"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface VoiceCapabilities {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  mediaRecorder: boolean;
}

export interface UseVoiceReturn {
  isRecording: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  capabilities: VoiceCapabilities;
  startListening: () => void;
  stopListening: () => void;
  startRecording: () => void;
  stopRecording: () => Promise<Blob | null>;
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
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [capabilities, setCapabilities] = useState<VoiceCapabilities>({
    speechRecognition: false,
    speechSynthesis: false,
    mediaRecorder: false,
  });

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        setIsRecording(false);
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        setIsRecording(false);
        recorder.stream.getTracks().forEach((track) => track.stop());
        resolve(blob);
      };

      recorder.stop();
    });
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
    stopRecording();
    cancelSpeech();
  }, [stopListening, stopRecording, cancelSpeech]);

  return {
    isRecording,
    isListening,
    transcript,
    interimTranscript,
    capabilities,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    speak,
    cancelSpeech,
    reset,
  };
}
