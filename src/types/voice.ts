// =============================================================================
// Livsplanlegg – Voice System Types
// =============================================================================

export type STTProvider = 'whisper' | 'deepgram' | 'azure' | 'browser_native';

export interface VoiceState {
  is_listening: boolean;
  is_processing: boolean;
  is_speaking: boolean;
  current_transcript: string;
  interim_transcript: string;
  error: string | null;
  provider: STTProvider;
  language: string;
  noise_level: number; // 0.0 – 1.0
  session_id: string | null;
  started_at: string | null;
}

export interface TranscriptEntry {
  id: string;
  session_id: string;
  text: string;
  is_final: boolean;
  confidence: number; // 0.0 – 1.0
  language: string;
  start_time: number; // ms offset from session start
  end_time: number;
  words: TranscriptWord[];
  speaker: string | null;
  created_at: string;
}

export interface TranscriptWord {
  word: string;
  start_time: number;
  end_time: number;
  confidence: number;
}

export interface VoiceCommand {
  id: string;
  user_id: string;
  transcript: string;
  language: string;
  confidence: number;
  intent: string | null;
  parsed_data: Record<string, unknown> | null;
  result_action: string | null;
  result_entity_type: string | null;
  result_entity_id: string | null;
  processing_time_ms: number | null;
  stt_provider: STTProvider;
  audio_duration_ms: number | null;
  created_at: string;
}

export interface VoiceCapabilities {
  stt_available: boolean;
  tts_available: boolean;
  supported_languages: string[];
  preferred_language: string;
  provider: STTProvider;
  max_recording_seconds: number;
  continuous_listening: boolean;
  wake_word_enabled: boolean;
  wake_word: string | null;
  noise_cancellation: boolean;
}

export interface VoiceSession {
  id: string;
  user_id: string;
  provider: STTProvider;
  language: string;
  started_at: string;
  ended_at: string | null;
  total_audio_ms: number;
  transcript_entries: TranscriptEntry[];
  commands_issued: number;
  errors: VoiceError[];
}

export interface VoiceError {
  code: string;
  message: string;
  recoverable: boolean;
  timestamp: string;
}

export interface VoiceSettings {
  provider: STTProvider;
  language: string;
  continuous_listening: boolean;
  wake_word_enabled: boolean;
  wake_word: string;
  auto_punctuation: boolean;
  profanity_filter: boolean;
  beep_on_start: boolean;
  beep_on_end: boolean;
  tts_voice: string | null;
  tts_speed: number; // 0.5 – 2.0
  tts_enabled: boolean;
}
