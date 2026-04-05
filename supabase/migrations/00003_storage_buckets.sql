-- =============================================================================
-- Livsplanlegg - Personal Operating System
-- Migration 00003: Storage Buckets & Policies
-- =============================================================================

-- =============================================================================
-- CREATE STORAGE BUCKETS
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('attachments', 'attachments', false, 52428800, array[
    'application/pdf',
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv'
  ]),
  ('receipts', 'receipts', false, 10485760, array[
    'application/pdf',
    'image/png', 'image/jpeg', 'image/webp'
  ]),
  ('voice-audio', 'voice-audio', false, 26214400, array[
    'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav'
  ]),
  ('tender-files', 'tender-files', false, 104857600, array[
    'application/pdf',
    'image/png', 'image/jpeg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'text/plain', 'text/csv'
  ]);

-- =============================================================================
-- STORAGE POLICIES: attachments
-- =============================================================================

create policy "attachments_select_own"
  on storage.objects for select
  using (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "attachments_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "attachments_update_own"
  on storage.objects for update
  using (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "attachments_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================================================
-- STORAGE POLICIES: receipts
-- =============================================================================

create policy "receipts_select_own"
  on storage.objects for select
  using (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "receipts_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "receipts_update_own"
  on storage.objects for update
  using (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "receipts_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================================================
-- STORAGE POLICIES: voice-audio
-- =============================================================================

create policy "voice_audio_select_own"
  on storage.objects for select
  using (
    bucket_id = 'voice-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "voice_audio_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'voice-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "voice_audio_update_own"
  on storage.objects for update
  using (
    bucket_id = 'voice-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "voice_audio_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'voice-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================================================
-- STORAGE POLICIES: tender-files
-- =============================================================================

create policy "tender_files_select_own"
  on storage.objects for select
  using (
    bucket_id = 'tender-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "tender_files_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'tender-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "tender_files_update_own"
  on storage.objects for update
  using (
    bucket_id = 'tender-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "tender_files_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'tender-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
