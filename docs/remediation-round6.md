# Remediation Round 6

## Batch A — AI Contracts, Area Taxonomy, and Clarification Flow

### Tasks
- [x] Define canonical area vocabulary: asplan-viak, ytly, privat, okonomi, trening
- [x] Add explicit alias map (jobb->asplan-viak, helse->trening, ytly.no->ytly)
- [x] Upgrade normalizeToolCallInput to validate canonical validity
- [x] Fix /api/ai/command: unresolved writes return clarification, not confirmation
- [x] Tighten AI tool enums to canonical + aliases with normalization
- [x] Fix weekly_summary misleading "completed this week" claim

### Acceptance Criteria
- One canonical area taxonomy in code
- Legacy area inputs normalized before execution
- Invalid/unresolved write tool calls return clarification, not confirmation
- Confirmation UI only for actually executable tool calls
- Weekly summary honest about proxy logic
- AI tool enums/contracts aligned with execution layer

## Batch B — Voice Consistency and TTS Honesty

### Tasks
- [x] Fix repeated-transcript handling in assistant page
- [x] Harden global mic confirmation state (no premature auto-dismiss)
- [x] Unify assistant voice and global mic semantic contract
- [x] Make voice_tts_enabled consistently scoped
- [x] Keep "no fake server fallback" rule
- [x] Remove dead states from MicButton/useVoice

### Acceptance Criteria
- Repeated identical voice commands work
- Global mic confirmation doesn't disappear prematurely
- Assistant and global mic consistent behavior
- voice_tts_enabled truthful and consistently applied
- No fake fallback path

## Batch C — Command Palette Context + Real Integration Tests

### Tasks
- [x] Calendar deep-link: fetch event by ID when outside loaded range
- [x] Projects deep-link: implement projectId support
- [x] Notes deep-link: implement noteId support in /logg
- [x] Replace weak integration tests with real ones
- [x] Add real tests for critical flows

### Acceptance Criteria
- All command palette result types contextually openable
- Event deep-links work outside current range
- Weak tests replaced by real behavior tests
- Critical flows protected by real tests
