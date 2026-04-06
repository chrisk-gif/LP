-- =============================================================================
-- Livsplanlegg - Seed Data
-- Realistic Norwegian demo data for development
-- Uses canonical areas: asplan-viak, ytly, privat, okonomi, trening
-- =============================================================================

do $$
declare
  demo_uid     uuid := '00000000-0000-0000-0000-000000000001';
  area_av      uuid := '11111111-1111-1111-1111-111111111001';
  area_ytly    uuid := '11111111-1111-1111-1111-111111111002';
  area_privat  uuid := '11111111-1111-1111-1111-111111111003';
  area_okonomi uuid := '11111111-1111-1111-1111-111111111004';
  area_trening uuid := '11111111-1111-1111-1111-111111111005';
  goal_1       uuid := '22222222-2222-2222-2222-222222222001';
  goal_2       uuid := '22222222-2222-2222-2222-222222222002';
  goal_3       uuid := '22222222-2222-2222-2222-222222222003';
  project_1    uuid := '33333333-3333-3333-3333-333333333001';
  project_2    uuid := '33333333-3333-3333-3333-333333333002';
  tender_1     uuid := '44444444-4444-4444-4444-444444444001';
  tender_2     uuid := '44444444-4444-4444-4444-444444444002';
  plan_1       uuid := '77777777-7777-7777-7777-777777777001';
begin

  -- Profile
  insert into profiles (id, display_name, locale, timezone, currency, preferences, onboarding_completed)
  values (demo_uid, 'Christian Kyllingstad', 'nb-NO', 'Europe/Oslo', 'NOK',
    '{"default_view": "dashboard", "compact_mode": false}'::jsonb, true)
  on conflict (id) do nothing;

  -- Canonical areas
  insert into areas (id, user_id, slug, name, color, icon, sort_order, is_system) values
    (area_av,      demo_uid, 'asplan-viak', 'Asplan Viak',  '#2563eb', 'Briefcase', 0, true),
    (area_ytly,    demo_uid, 'ytly',        'ytly.no',      '#7c3aed', 'Rocket',    1, true),
    (area_privat,  demo_uid, 'privat',      'Privat',       '#059669', 'Home',      2, true),
    (area_okonomi, demo_uid, 'okonomi',     'Økonomi',      '#d97706', 'Wallet',    3, true),
    (area_trening, demo_uid, 'trening',     'Trening',      '#dc2626', 'Dumbbell',  4, true)
  on conflict (user_id, slug) do nothing;

  -- Goals
  insert into goals (id, user_id, area_id, title, description, horizon, status, target_date, measurable_metric, current_progress, why_it_matters) values
    (goal_1, demo_uid, area_trening,
      'Fullfor halvmaraton under 1:45',
      'Trene systematisk mot halvmaraton i Oslo i september.',
      'yearly', 'active', '2026-09-19', 'Halvmaraton-tid i minutter', 0,
      'Fysisk helse er fundamentet for alt annet.'),
    (goal_2, demo_uid, area_av,
      'Vinne 3 av 5 neste tilbud',
      'Oke tilslagsprosenten ved bedre tilbudsstruktur.',
      'quarterly', 'active', '2026-06-30', 'Antall vunne tilbud', 1,
      'Tilbudsgevinst er direkte koblet til avdelingens omsetning.'),
    (goal_3, demo_uid, area_okonomi,
      'Spare 50 000 kr til bufferkonto',
      'Bygge opp en okonomisk buffer tilsvarende 2 maneders utgifter.',
      'yearly', 'active', '2026-12-31', 'Spart belop i NOK', 22000,
      'Okonomisk trygghet gir frihet til a ta gode valg.')
  on conflict (id) do nothing;

  -- Projects
  insert into projects (id, user_id, area_id, goal_id, title, description, type, status, priority, start_date, due_date, progress, notes) values
    (project_1, demo_uid, area_av, goal_2,
      'E39 Rogfast - Tilbudsutvikling',
      'Utarbeide komplett tilbud for geoteknisk radgivning pa Rogfast-prosjektet.',
      'tilbud', 'active', 'high', '2026-03-15', '2026-05-01', 35,
      'Samarbeider med geoteknikk-avdelingen i Sandvika.'),
    (project_2, demo_uid, area_privat, null,
      'Oppussing bad',
      'Totalrenovering av hovedbadet.',
      'privat', 'active', 'medium', '2026-04-01', '2026-06-15', 10,
      'Har fatt tilbud fra tre entreprenorer.')
  on conflict (id) do nothing;

  -- Tenders
  insert into tenders (id, user_id, area_id, project_id, title, client, due_date, status, probability, risk_level, next_milestone, sensitivity) values
    (tender_1, demo_uid, area_av, project_1,
      'E39 Rogfast - Geoteknisk radgivning', 'Statens vegvesen',
      '2026-05-01', 'preparing', 60, 'medium',
      'Intern kvalitetskontroll av tilbudet innen 20. april', 'confidential'),
    (tender_2, demo_uid, area_av, null,
      'Byasentunnelen - Konstruksjonsberegninger', 'Bane NOR',
      '2026-04-18', 'submitted', 45, 'high',
      'Avventer tilbakemelding fra Bane NOR', 'confidential')
  on conflict (id) do nothing;

  -- Tasks (10 across canonical areas)
  insert into tasks (user_id, area_id, project_id, goal_id, tender_id, title, description, status, priority, energy_level, due_date, scheduled_date, scheduled_time, estimated_minutes, tags, source, sort_order) values
    (demo_uid, area_av, project_1, null, tender_1,
      'Ferdigstill kostnadsestimat for Rogfast-tilbudet',
      'Beregn totale timer og kostnader for alle fagomrader.',
      'in_progress', 'high', 'high', '2026-04-10', '2026-04-07', '09:00', 120,
      array['tilbud', 'rogfast'], 'manual', 1),
    (demo_uid, area_av, null, null, tender_2,
      'Folg opp Bane NOR om tilbudsstatus',
      'Send e-post til kontaktperson hos Bane NOR.',
      'todo', 'medium', 'low', '2026-04-08', '2026-04-08', '10:00', 15,
      array['oppfolging'], 'manual', 2),
    (demo_uid, area_av, null, null, null,
      'Forbered presentasjon til avdelingsmotet',
      'Lag slides om tilbudsstatus Q1 og planer for Q2.',
      'todo', 'high', 'high', '2026-04-11', '2026-04-09', '13:00', 90,
      array['presentasjon'], 'manual', 3),
    (demo_uid, area_trening, null, goal_1, null,
      'Intervalltrening 6x1000m',
      'Oppvarming 2 km, 6x1000m pa 4:10-4:15/km med 90 sek pause.',
      'todo', 'medium', 'high', null, '2026-04-08', '06:30', 60,
      array['loping', 'intervall'], 'manual', 4),
    (demo_uid, area_privat, project_2, null, null,
      'Bestill fliser til badet',
      'Velg og bestill fliser fra Flisekompaniet.',
      'todo', 'medium', 'medium', '2026-04-15', '2026-04-10', null, 45,
      array['oppussing', 'bad'], 'manual', 5),
    (demo_uid, area_okonomi, null, goal_3, null,
      'Overfore 5000 kr til sparekonto',
      'Manedlig overforsel til bufferkonto.',
      'todo', 'medium', 'low', '2026-04-30', '2026-04-25', null, 10,
      array['sparing'], 'manual', 6),
    (demo_uid, area_av, project_1, null, tender_1,
      'Kvalitetssikre CV-er i tilbudet',
      'Ga gjennom alle CV-er som skal legges ved tilbudet.',
      'todo', 'high', 'medium', '2026-04-15', '2026-04-11', '10:00', 90,
      array['tilbud', 'kvalitetssikring'], 'manual', 7),
    (demo_uid, area_privat, null, null, null,
      'Handle matvarer til helgen',
      'Lag handleliste og handle pa Meny.',
      'inbox', 'low', 'low', '2026-04-11', null, null, 45,
      array['handle', 'mat'], 'manual', 8),
    (demo_uid, area_av, null, null, null,
      'Oppdater timeregistrering for mars',
      'Ga gjennom timelister og rett opp eventuelle mangler.',
      'done', 'medium', 'low', '2026-04-05', '2026-04-03', '14:00', 30,
      array['admin', 'timer'], 'manual', 9),
    (demo_uid, area_trening, null, goal_1, null,
      'Bestill tid hos fysioterapeut',
      'Sjekk opp venstre kne for sikkerhets skyld.',
      'todo', 'medium', 'low', '2026-04-12', null, null, 10,
      array['helse', 'fysio'], 'voice', 10)
  on conflict do nothing;

  -- Events
  insert into events (user_id, area_id, project_id, tender_id, title, description, event_type, start_time, end_time, all_day, location, color) values
    (demo_uid, area_av, project_1, tender_1,
      'Tilbudsmote Rogfast - intern gjennomgang',
      'Gjennomgang av tilbudsutkast med fagansvarlige.',
      'meeting', '2026-04-09 09:00:00+02', '2026-04-09 10:30:00+02',
      false, 'Asplan Viak, Sandvika - Rom 3B', '#EF4444'),
    (demo_uid, area_av, null, null,
      'Avdelingsmote Q2 kickoff',
      'Kvartalsvis avdelingsmote.',
      'meeting', '2026-04-11 12:00:00+02', '2026-04-11 14:00:00+02',
      false, 'Asplan Viak, Sandvika - Kantina', '#F59E0B'),
    (demo_uid, area_trening, null, null,
      'Lopetur Sognsvann',
      'Lang rolig tur 14 km.',
      'block', '2026-04-12 07:00:00+02', '2026-04-12 08:30:00+02',
      false, 'Sognsvann', '#10B981'),
    (demo_uid, area_privat, null, null,
      'Middag med venner',
      'Laksemiddag hjemme.',
      'personal', '2026-04-12 18:00:00+02', '2026-04-12 22:00:00+02',
      false, 'Hjemme', '#3B82F6'),
    (demo_uid, area_av, null, tender_2,
      'Frist: Byasentunnelen tilbudssvar',
      'Forventet dato for svar fra Bane NOR.',
      'deadline', '2026-04-18 00:00:00+02', '2026-04-18 23:59:59+02',
      true, null, '#EF4444')
  on conflict do nothing;

  -- Finance items
  insert into finance_items (user_id, title, description, type, status, amount, currency, vendor, category, due_date, paid_date, recurrence_pattern, reminder_days_before, notes) values
    (demo_uid, 'Husleie april', null, 'bill', 'upcoming', 14500, 'NOK', 'Utleier', 'Bolig', '2026-04-01', null, 'FREQ=MONTHLY;BYMONTHDAY=1', 3, null),
    (demo_uid, 'Strom mars', 'Fjordkraft faktura for mars', 'bill', 'due', 1850, 'NOK', 'Fjordkraft', 'Strom', '2026-04-10', null, null, 3, null),
    (demo_uid, 'Spotify Family', null, 'subscription', 'paid', 189, 'NOK', 'Spotify', 'Underholdning', '2026-04-15', '2026-04-15', 'FREQ=MONTHLY;BYMONTHDAY=15', 1, null),
    (demo_uid, 'Treningssenter SATS', 'Manedlig medlemskap', 'subscription', 'upcoming', 599, 'NOK', 'SATS', 'Helse', '2026-04-20', null, 'FREQ=MONTHLY;BYMONTHDAY=20', 2, null),
    (demo_uid, 'Reiseutlegg Sandvika', 'Buss og tog til kundemote', 'reimbursement', 'upcoming', 386, 'NOK', 'Asplan Viak', 'Reise', null, null, null, 0, 'Lever reiseregning i Unit4.')
  on conflict do nothing;

  -- Training plan
  insert into training_plans (id, user_id, title, description, goal_id, start_date, end_date, status) values
    (plan_1, demo_uid, 'Halvmaraton-forberedelse V2026',
      'Progressiv treningsplan mot Oslo Halvmaraton 19. september.',
      goal_1, '2026-03-01', '2026-09-19', 'active')
  on conflict (id) do nothing;

  -- Workout sessions
  insert into workout_sessions (user_id, plan_id, title, session_type, planned_at, completed_at, duration_minutes, intensity, notes, metrics) values
    (demo_uid, plan_1, 'Rolig langtur 12 km', 'loping',
      '2026-04-05 07:00:00+02', '2026-04-05 08:05:00+02', 65, 'easy',
      'Foltes bra. Holdt pulsen under 148.',
      '{"distance_km": 12.1, "avg_pace_min_km": 5.37, "avg_heart_rate": 145}'::jsonb),
    (demo_uid, plan_1, 'Intervall 5x1000m', 'loping',
      '2026-04-03 06:30:00+02', '2026-04-03 07:20:00+02', 50, 'hard',
      'Tunge intervaller.',
      '{"distance_km": 8.5, "avg_heart_rate": 168}'::jsonb),
    (demo_uid, plan_1, 'Styrketrening overkropp + core', 'styrke',
      '2026-04-04 17:00:00+02', '2026-04-04 17:55:00+02', 55, 'moderate',
      'Fokus pa skulderstabilitet og core.',
      '{"exercises": ["planke", "marklov", "skulderpress", "rows"]}'::jsonb)
  on conflict do nothing;

  -- Reviews
  insert into reviews (user_id, period, period_start, period_end, wins, blockers, lessons_learned, next_focus, metrics_snapshot, ai_generated) values
    (demo_uid, 'weekly', '2026-03-30', '2026-04-05',
      'Fikk levert Byasentunnel-tilbudet i tide. Tre gode treningsokter.',
      'Ventet for lenge med a starte pa Rogfast-kalkylen.',
      'Start tilbudsarbeid tidligere i prosessen.',
      'Fokus pa Rogfast-tilbudet denne uken.',
      '{"tasks_completed": 7, "tasks_created": 5, "training_sessions": 3}'::jsonb, false),
    (demo_uid, 'monthly', '2026-03-01', '2026-03-31',
      'Sendt inn to tilbud. Okonomisk buffer okt til 22 000 kr.',
      'For mange moter i uke 11 og 12.',
      'Blokkere onsdager som motefrie dager har fungert bra.',
      'Vinne minst ett av de to innsendte tilbudene.',
      '{"tasks_completed": 28, "tenders_submitted": 2}'::jsonb, false)
  on conflict do nothing;

  -- Inbox items
  insert into inbox_items (user_id, content, item_type, area_id, processed, source, raw_transcript) values
    (demo_uid, 'Husk a sjekke om forsikringen dekker vannskade pa badet', 'task', area_privat, false, 'voice',
      'Husk a sjekke om forsikringen dekker vannskade pa badet'),
    (demo_uid, 'Ide: Lage en mal for tilbudspresentasjoner', 'idea', area_av, false, 'manual', null),
    (demo_uid, 'BIM-kurs hos Tekna i mai. Relevant for digitalisering.', 'training', area_av, false, 'manual', null)
  on conflict do nothing;

  -- Notes
  insert into notes (user_id, area_id, project_id, tender_id, title, content, pinned, tags) values
    (demo_uid, area_av, project_1, tender_1,
      'Rogfast - Nokkelkontakter',
      E'Statens vegvesen:\n- Prosjektleder: Kari Nordmann\n\nIntern:\n- Fagansvarlig geo: Per Eriksen',
      true, array['kontakter', 'rogfast']),
    (demo_uid, area_trening, null, null,
      'Treningsnotater - Halvmaratonplan',
      E'Ukentlig struktur:\n- Mandag: Intervall\n- Onsdag: Rolig 8-10 km\n- Torsdag: Styrke\n- Lordag: Langtur',
      true, array['trening', 'halvmaraton']),
    (demo_uid, area_privat, project_2, null,
      'Badoppussing - Materialliste',
      E'Fliser:\n- Gulv: Ragno Woodplace Caramel 20x120\n- Vegg: Marazzi SistemC Bianco 30x60',
      false, array['oppussing', 'bad'])
  on conflict do nothing;

  -- User preferences
  insert into user_preferences (user_id, working_hours, planning_style, review_cadence, ai_auto_execute, voice_tts_enabled, theme, dashboard_widgets)
  values (demo_uid,
    '{"start": "07:30", "end": "15:30", "days": [1,2,3,4,5]}'::jsonb,
    'structured',
    '{"daily": true, "weekly": true, "monthly": true, "quarterly": true}'::jsonb,
    false, true, 'system',
    '["tasks", "calendar", "tenders", "training", "finance"]'::jsonb)
  on conflict (user_id) do nothing;

end $$;
