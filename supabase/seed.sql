-- =============================================================================
-- Livsplanlegg - Seed Data
-- Realistic Norwegian demo data for development
-- =============================================================================
-- NOTE: This seed file bypasses the auth.users trigger and inserts directly.
-- For local development with supabase start, a demo user must exist in auth.users.
-- =============================================================================

-- Demo user ID (use a fixed UUID for reproducible seeding)
do $$
declare
  demo_uid     uuid := '00000000-0000-0000-0000-000000000001';
  area_privat  uuid := '11111111-1111-1111-1111-111111111001';
  area_jobb    uuid := '11111111-1111-1111-1111-111111111002';
  area_helse   uuid := '11111111-1111-1111-1111-111111111003';
  area_okonomi uuid := '11111111-1111-1111-1111-111111111004';
  area_av      uuid := '11111111-1111-1111-1111-111111111005';
  goal_1       uuid := '22222222-2222-2222-2222-222222222001';
  goal_2       uuid := '22222222-2222-2222-2222-222222222002';
  goal_3       uuid := '22222222-2222-2222-2222-222222222003';
  project_1    uuid := '33333333-3333-3333-3333-333333333001';
  project_2    uuid := '33333333-3333-3333-3333-333333333002';
  tender_1     uuid := '44444444-4444-4444-4444-444444444001';
  tender_2     uuid := '44444444-4444-4444-4444-444444444002';
  task_1       uuid := '55555555-5555-5555-5555-555555555001';
  task_2       uuid := '55555555-5555-5555-5555-555555555002';
  task_3       uuid := '55555555-5555-5555-5555-555555555003';
  task_4       uuid := '55555555-5555-5555-5555-555555555004';
  task_5       uuid := '55555555-5555-5555-5555-555555555005';
  task_6       uuid := '55555555-5555-5555-5555-555555555006';
  task_7       uuid := '55555555-5555-5555-5555-555555555007';
  task_8       uuid := '55555555-5555-5555-5555-555555555008';
  task_9       uuid := '55555555-5555-5555-5555-555555555009';
  task_10      uuid := '55555555-5555-5555-5555-555555555010';
  event_1      uuid := '66666666-6666-6666-6666-666666666001';
  event_2      uuid := '66666666-6666-6666-6666-666666666002';
  event_3      uuid := '66666666-6666-6666-6666-666666666003';
  event_4      uuid := '66666666-6666-6666-6666-666666666004';
  event_5      uuid := '66666666-6666-6666-6666-666666666005';
  plan_1       uuid := '77777777-7777-7777-7777-777777777001';
  workout_1    uuid := '88888888-8888-8888-8888-888888888001';
  workout_2    uuid := '88888888-8888-8888-8888-888888888002';
  workout_3    uuid := '88888888-8888-8888-8888-888888888003';
begin

  -- ===========================================================================
  -- PROFILE
  -- ===========================================================================
  insert into profiles (id, display_name, avatar_url, locale, timezone, currency, preferences, onboarding_completed)
  values (
    demo_uid,
    'Christian Kyllingstad',
    null,
    'nb-NO',
    'Europe/Oslo',
    'NOK',
    '{"default_view": "dashboard", "compact_mode": false}'::jsonb,
    true
  )
  on conflict (id) do nothing;

  -- ===========================================================================
  -- AREAS (5 default areas)
  -- ===========================================================================
  insert into areas (id, user_id, slug, name, color, icon, sort_order, is_system) values
    (area_privat,  demo_uid, 'privat',      'Privat',      '#3B82F6', 'Home',       0, true),
    (area_jobb,    demo_uid, 'jobb',        'Jobb',        '#F59E0B', 'Briefcase',  1, true),
    (area_helse,   demo_uid, 'helse',       'Helse',       '#10B981', 'Heart',      2, true),
    (area_okonomi, demo_uid, 'okonomi',     'Okonomi',     '#8B5CF6', 'Wallet',     3, true),
    (area_av,      demo_uid, 'asplan-viak', 'Asplan Viak', '#EF4444', 'Building2',  4, true)
  on conflict (user_id, slug) do nothing;

  -- ===========================================================================
  -- GOALS (3 goals)
  -- ===========================================================================
  insert into goals (id, user_id, area_id, title, description, horizon, status, target_date, measurable_metric, current_progress, why_it_matters) values
    (
      goal_1, demo_uid, area_helse,
      'Fullfor halvmaraton under 1:45',
      'Trene systematisk mot halvmaraton i Oslo i september. Fokus pa utholdenhet og fart.',
      'yearly', 'active', '2026-09-19',
      'Halvmaraton-tid i minutter', 0,
      'Fysisk helse er fundamentet for alt annet. Et ambisiost mal gir motivasjon til regelmessig trening.'
    ),
    (
      goal_2, demo_uid, area_av,
      'Vinne 3 av 5 neste tilbud',
      'Oke tilslagsprosenten ved bedre tilbudsstruktur og tidligere kundedialog.',
      'quarterly', 'active', '2026-06-30',
      'Antall vunne tilbud', 1,
      'Tilbudsgevinst er direkte koblet til avdelingens omsetning og min karriereutvikling.'
    ),
    (
      goal_3, demo_uid, area_okonomi,
      'Spare 50 000 kr til bufferkonto',
      'Bygge opp en okonomisk buffer tilsvarende 2 maneders utgifter.',
      'yearly', 'active', '2026-12-31',
      'Spart belop i NOK', 22000,
      'Okonomisk trygghet gir frihet til a ta gode valg uten press.'
    )
  on conflict (id) do nothing;

  -- ===========================================================================
  -- PROJECTS (2 projects)
  -- ===========================================================================
  insert into projects (id, user_id, area_id, goal_id, title, description, type, status, priority, start_date, due_date, progress, notes) values
    (
      project_1, demo_uid, area_av, goal_2,
      'E39 Rogfast - Tilbudsutvikling',
      'Utarbeide komplett tilbud for geoteknisk radgivning pa Rogfast-prosjektet. Inkluderer grunnundersokelser, stabilitetsanalyser og rapportering.',
      'tilbud', 'active', 'high',
      '2026-03-15', '2026-05-01', 35,
      'Samarbeider med geoteknikk-avdelingen i Sandvika. Viktig referanseprosjekt.'
    ),
    (
      project_2, demo_uid, area_privat, null,
      'Oppussing bad',
      'Totalrenovering av hovedbadet. Riving, membran, fliser, nytt servantskap og dusjlosning.',
      'privat', 'active', 'medium',
      '2026-04-01', '2026-06-15', 10,
      'Har fatt tilbud fra tre entreprenorer. Matte velge innen uke 15.'
    )
  on conflict (id) do nothing;

  -- ===========================================================================
  -- TENDERS (2 tenders)
  -- ===========================================================================
  insert into tenders (id, user_id, area_id, project_id, title, client, due_date, status, probability, risk_level, next_milestone, sensitivity) values
    (
      tender_1, demo_uid, area_av, project_1,
      'E39 Rogfast - Geoteknisk radgivning',
      'Statens vegvesen',
      '2026-05-01', 'preparing', 60, 'medium',
      'Intern kvalitetskontroll av tilbudet innen 20. april',
      'confidential'
    ),
    (
      tender_2, demo_uid, area_av, null,
      'Byasentunnelen - Konstruksjonsberegninger',
      'Bane NOR',
      '2026-04-18', 'submitted', 45, 'high',
      'Avventer tilbakemelding fra Bane NOR',
      'confidential'
    )
  on conflict (id) do nothing;

  -- ===========================================================================
  -- TASKS (10 tasks across areas)
  -- ===========================================================================
  insert into tasks (id, user_id, area_id, project_id, goal_id, tender_id, title, description, status, priority, energy_level, due_date, scheduled_date, scheduled_time, estimated_minutes, tags, source, sort_order) values
    (
      task_1, demo_uid, area_av, project_1, null, tender_1,
      'Ferdigstill kostnadsestimat for Rogfast-tilbudet',
      'Beregn totale timer og kostnader for alle fagomrader. Inkluder reisekostnader og UE.',
      'in_progress', 'high', 'high',
      '2026-04-10', '2026-04-07', '09:00', 120,
      array['tilbud', 'rogfast'], 'manual', 1
    ),
    (
      task_2, demo_uid, area_av, null, null, tender_2,
      'Folg opp Bane NOR om tilbudsstatus',
      'Send e-post til kontaktperson hos Bane NOR for a sjekke status pa Byasentunnel-tilbudet.',
      'todo', 'medium', 'low',
      '2026-04-08', '2026-04-08', '10:00', 15,
      array['oppfolging', 'bane-nor'], 'manual', 2
    ),
    (
      task_3, demo_uid, area_jobb, null, null, null,
      'Forbered presentasjon til avdelingsmotet',
      'Lag slides om tilbudsstatus Q1 og planer for Q2. Bruk data fra tilbudsanalysen.',
      'todo', 'high', 'high',
      '2026-04-11', '2026-04-09', '13:00', 90,
      array['presentasjon', 'avdelingsmote'], 'manual', 3
    ),
    (
      task_4, demo_uid, area_helse, null, goal_1, null,
      'Intervalltrening 6x1000m',
      'Oppvarming 2 km, 6x1000m pa 4:10-4:15/km med 90 sek pause, nedjogg 1 km.',
      'todo', 'medium', 'high',
      null, '2026-04-08', '06:30', 60,
      array['loping', 'intervall'], 'manual', 4
    ),
    (
      task_5, demo_uid, area_privat, project_2, null, null,
      'Bestill fliser til badet',
      'Velg og bestill fliser fra Flisekompaniet. Husk a sjekke leveringstid.',
      'todo', 'medium', 'medium',
      '2026-04-15', '2026-04-10', null, 45,
      array['oppussing', 'bad'], 'manual', 5
    ),
    (
      task_6, demo_uid, area_okonomi, null, goal_3, null,
      'Overfore 5000 kr til sparekonto',
      'Manedlig overforsel til bufferkonto. Sett opp fast trekk om mulig.',
      'todo', 'medium', 'low',
      '2026-04-30', '2026-04-25', null, 10,
      array['sparing', 'manedlig'], 'manual', 6
    ),
    (
      task_7, demo_uid, area_av, project_1, null, tender_1,
      'Kvalitetssikre CV-er i tilbudet',
      'Ga gjennom alle CV-er som skal legges ved tilbudet. Sjekk relevans og oppdater der det trengs.',
      'todo', 'high', 'medium',
      '2026-04-15', '2026-04-11', '10:00', 90,
      array['tilbud', 'kvalitetssikring'], 'manual', 7
    ),
    (
      task_8, demo_uid, area_privat, null, null, null,
      'Handle matvarer til helgen',
      'Lag handleliste og handle pa Meny. Husk a kjope inn til laksemiddag pa lordag.',
      'inbox', 'low', 'low',
      '2026-04-11', null, null, 45,
      array['handle', 'mat'], 'manual', 8
    ),
    (
      task_9, demo_uid, area_jobb, null, null, null,
      'Oppdater timeregistrering for mars',
      'Ga gjennom timelister og rett opp eventuelle mangler for mars maned.',
      'done', 'medium', 'low',
      '2026-04-05', '2026-04-03', '14:00', 30,
      array['admin', 'timer'], 'manual', 9
    ),
    (
      task_10, demo_uid, area_helse, null, goal_1, null,
      'Bestill tid hos fysioterapeut',
      'Sjekk opp venstre kne for sikkerhets skyld for treningsoka oker.',
      'todo', 'medium', 'low',
      '2026-04-12', null, null, 10,
      array['helse', 'fysio'], 'voice', 10
    )
  on conflict (id) do nothing;

  -- ===========================================================================
  -- EVENTS (5 events)
  -- ===========================================================================
  insert into events (id, user_id, area_id, project_id, tender_id, title, description, event_type, start_time, end_time, all_day, location, color) values
    (
      event_1, demo_uid, area_av, project_1, tender_1,
      'Tilbudsmote Rogfast - intern gjennomgang',
      'Gjennomgang av tilbudsutkast med fagansvarlige. Fokus pa teknisk losning og pris.',
      'meeting',
      '2026-04-09 09:00:00+02', '2026-04-09 10:30:00+02',
      false, 'Asplan Viak, Sandvika - Rom 3B', '#EF4444'
    ),
    (
      event_2, demo_uid, area_jobb, null, null,
      'Avdelingsmote Q2 kickoff',
      'Kvartalsvis avdelingsmote med status, planer og sosialt.',
      'meeting',
      '2026-04-11 12:00:00+02', '2026-04-11 14:00:00+02',
      false, 'Asplan Viak, Sandvika - Kantina', '#F59E0B'
    ),
    (
      event_3, demo_uid, area_helse, null, null,
      'Lopetur Sognsvann',
      'Lang rolig tur 14 km. Fokus pa puls under 150.',
      'block',
      '2026-04-12 07:00:00+02', '2026-04-12 08:30:00+02',
      false, 'Sognsvann', '#10B981'
    ),
    (
      event_4, demo_uid, area_privat, null, null,
      'Middag med venner',
      'Laksemiddag hjemme. Husk a handle inn til lordag formiddag.',
      'personal',
      '2026-04-12 18:00:00+02', '2026-04-12 22:00:00+02',
      false, 'Hjemme', '#3B82F6'
    ),
    (
      event_5, demo_uid, area_av, null, tender_2,
      'Frist: Byasentunnelen tilbudssvar',
      'Forventet dato for svar fra Bane NOR pa tilbudet.',
      'deadline',
      '2026-04-18 00:00:00+02', '2026-04-18 23:59:59+02',
      true, null, '#EF4444'
    )
  on conflict (id) do nothing;

  -- ===========================================================================
  -- FINANCE ITEMS (5 items)
  -- ===========================================================================
  insert into finance_items (user_id, title, description, type, status, amount, currency, vendor, category, due_date, paid_date, recurrence_pattern, reminder_days_before, notes) values
    (
      demo_uid, 'Husleie april', null,
      'bill', 'upcoming', 14500, 'NOK',
      'Utleier', 'Bolig',
      '2026-04-01', null, 'FREQ=MONTHLY;BYMONTHDAY=1', 3, null
    ),
    (
      demo_uid, 'Strom mars', 'Fjordkraft faktura for mars',
      'bill', 'due', 1850, 'NOK',
      'Fjordkraft', 'Strom',
      '2026-04-10', null, null, 3, 'Noe hoyere enn vanlig pga kald mars'
    ),
    (
      demo_uid, 'Spotify Family', null,
      'subscription', 'paid', 189, 'NOK',
      'Spotify', 'Underholdning',
      '2026-04-15', '2026-04-15', 'FREQ=MONTHLY;BYMONTHDAY=15', 1, null
    ),
    (
      demo_uid, 'Treningssenter SATS', 'Manedlig medlemskap',
      'subscription', 'upcoming', 599, 'NOK',
      'SATS', 'Helse',
      '2026-04-20', null, 'FREQ=MONTHLY;BYMONTHDAY=20', 2, null
    ),
    (
      demo_uid, 'Reiseutlegg Sandvika', 'Buss og tog til kundemote 28. mars',
      'reimbursement', 'upcoming', 386, 'NOK',
      'Asplan Viak', 'Reise',
      null, null, null, 0,
      'Lever reiseregning i Unit4. Husk kvitteringer.'
    )
  on conflict do nothing;

  -- ===========================================================================
  -- TRAINING PLAN (1 plan)
  -- ===========================================================================
  insert into training_plans (id, user_id, title, description, goal_id, start_date, end_date, status) values
    (
      plan_1, demo_uid,
      'Halvmaraton-forberedelse V2026',
      'Progressiv treningsplan mot Oslo Halvmaraton 19. september. 4 okter per uke med gradvis okt volum.',
      goal_1,
      '2026-03-01', '2026-09-19', 'active'
    )
  on conflict (id) do nothing;

  -- ===========================================================================
  -- WORKOUT SESSIONS (3 sessions)
  -- ===========================================================================
  insert into workout_sessions (id, user_id, plan_id, title, session_type, planned_at, completed_at, duration_minutes, intensity, notes, metrics) values
    (
      workout_1, demo_uid, plan_1,
      'Rolig langtur 12 km',
      'loping',
      '2026-04-05 07:00:00+02', '2026-04-05 08:05:00+02',
      65, 'easy',
      'Foltes bra. Holdt pulsen under 148 hele veien. Fin tur rundt Sognsvann og Maridalsvannet.',
      '{"distance_km": 12.1, "avg_pace_min_km": 5.37, "avg_heart_rate": 145, "max_heart_rate": 153}'::jsonb
    ),
    (
      workout_2, demo_uid, plan_1,
      'Intervall 5x1000m',
      'loping',
      '2026-04-03 06:30:00+02', '2026-04-03 07:20:00+02',
      50, 'hard',
      'Tunge intervaller. Siste rep ble litt for raskt, men generelt bra okt.',
      '{"distance_km": 8.5, "intervals": [{"rep": 1, "time_sec": 248}, {"rep": 2, "time_sec": 250}, {"rep": 3, "time_sec": 252}, {"rep": 4, "time_sec": 249}, {"rep": 5, "time_sec": 244}], "avg_heart_rate": 168}'::jsonb
    ),
    (
      workout_3, demo_uid, plan_1,
      'Styrketrening overkropp + core',
      'styrke',
      '2026-04-04 17:00:00+02', '2026-04-04 17:55:00+02',
      55, 'moderate',
      'Fokus pa skulderstabilitet og core. Bra okt pa SATS Majorstuen.',
      '{"exercises": ["planke", "marklov", "skulderpress", "rows", "russian_twist"], "sets": 4, "reps_range": "8-12"}'::jsonb
    )
  on conflict (id) do nothing;

  -- ===========================================================================
  -- REVIEWS (2 reviews)
  -- ===========================================================================
  insert into reviews (user_id, period, period_start, period_end, wins, blockers, lessons_learned, next_focus, freeform_notes, metrics_snapshot, ai_generated) values
    (
      demo_uid, 'weekly',
      '2026-03-30', '2026-04-05',
      'Fikk levert Byasentunnel-tilbudet i tide. Tre gode treningsokter gjennomfort. Fikk endelig bestemt fliser til badet.',
      'Ventet for lenge med a starte pa Rogfast-kalkylen. Stromregningen overrasket negativt.',
      'Start tilbudsarbeid tidligere i prosessen. Sett av dedikerte blokker i kalenderen for konsentrert arbeid.',
      'Fokus pa Rogfast-tilbudet denne uken. Fa kontroll pa okonomi for april. Tre treningsokter minimum.',
      null,
      '{"tasks_completed": 7, "tasks_created": 5, "training_sessions": 3, "finance_items_paid": 2}'::jsonb,
      false
    ),
    (
      demo_uid, 'monthly',
      '2026-03-01', '2026-03-31',
      'Sendt inn to tilbud. Okonomisk buffer okt til 22 000 kr. Startet ny treningsplan.',
      'For mange moter i uke 11 og 12. Lite tid til dypt arbeid.',
      'Blokkere onsdager som motefrie dager har fungert bra. Fortsett med det.',
      'Vinne minst ett av de to innsendte tilbudene. Etablere fast treningsrytme med 4 okter/uke.',
      'Mars var en travel maned med mye tilbudsarbeid. Bra progresjon pa trening tross alt.',
      '{"tasks_completed": 28, "tasks_created": 22, "training_sessions": 12, "tenders_submitted": 2, "savings_added": 5000}'::jsonb,
      false
    )
  on conflict do nothing;

  -- ===========================================================================
  -- INBOX ITEMS (3 items)
  -- ===========================================================================
  insert into inbox_items (user_id, content, item_type, area_id, processed, source, raw_transcript) values
    (
      demo_uid,
      'Husk a sjekke om forsikringen dekker vannskade pa badet for vi starter riving',
      'task', area_privat, false, 'voice',
      'Husk a sjekke om forsikringen dekker vannskade pa badet for vi starter riving'
    ),
    (
      demo_uid,
      'Ide: Lage en mal for tilbudspresentasjoner som kan gjenbrukes pa tvers av prosjekter',
      'idea', area_av, false, 'manual',
      null
    ),
    (
      demo_uid,
      'Fikk tips om BIM-kurs hos Tekna i mai. Kan vaere relevant for digitalisering av tilbudsprosessen.',
      'training', area_jobb, false, 'manual',
      null
    )
  on conflict do nothing;

  -- ===========================================================================
  -- NOTES (3 notes)
  -- ===========================================================================
  insert into notes (user_id, area_id, project_id, tender_id, title, content, pinned, tags) values
    (
      demo_uid, area_av, project_1, tender_1,
      'Rogfast - Nokkelkontakter',
      E'Statens vegvesen:\n- Prosjektleder: Kari Nordmann (kari.nordmann@vegvesen.no)\n- Geoteknisk ansvarlig: Ola Hansen\n\nIntern:\n- Fagansvarlig geo: Per Eriksen\n- Tilbudsleder: Christian K.\n- Kvalitetssikrer: Anne Johansen',
      true,
      array['kontakter', 'rogfast']
    ),
    (
      demo_uid, area_helse, null, null,
      'Treningsnotater - Halvmaratonplan',
      E'Ukentlig struktur:\n- Mandag: Intervall/fart\n- Onsdag: Rolig mellomtur 8-10 km\n- Torsdag: Styrke\n- Lordag: Langtur (progressivt 12-21 km)\n\nPulssoner:\n- Rolig: 130-148\n- Terskel: 160-170\n- Intervall: 170-180\n\nMal: Sub 1:45 = snitt 4:58/km',
      true,
      array['trening', 'halvmaraton', 'plan']
    ),
    (
      demo_uid, area_privat, project_2, null,
      'Badoppussing - Materialliste',
      E'Fliser:\n- Gulv: Ragno Woodplace Caramel 20x120 (ca 8 kvm)\n- Vegg: Marazzi SistemC Bianco 30x60 (ca 18 kvm)\n\nServant:\n- Svedbergs Forma 100cm med underskuff\n\nDusj:\n- INR?"Linc 21" glassdor 90x200\n\nArmatur:\n- Tapwell EVM184 i sort\n\nTilbud fra entreprenorer:\n1. Ronny Ror AS: 185 000 kr\n2. Bad & Flis Eksperten: 210 000 kr\n3. Mesterflikk: 172 000 kr (men lengre leveringstid)',
      false,
      array['oppussing', 'bad', 'materialer']
    )
  on conflict do nothing;

  -- ===========================================================================
  -- USER PREFERENCES
  -- ===========================================================================
  insert into user_preferences (user_id, working_hours, planning_style, review_cadence, finance_reminder_defaults, training_defaults, ai_auto_execute, voice_tts_enabled, theme, dashboard_widgets)
  values (
    demo_uid,
    '{"start": "07:30", "end": "15:30", "days": [1,2,3,4,5]}'::jsonb,
    'structured',
    '{"daily": true, "weekly": true, "monthly": true, "quarterly": true}'::jsonb,
    '{"days_before": 3, "notify_via": ["push", "email"]}'::jsonb,
    '{"preferred_time": "06:30", "default_duration_minutes": 60, "rest_day": "friday"}'::jsonb,
    false,
    true,
    'system',
    '["tasks", "calendar", "tenders", "training", "finance"]'::jsonb
  )
  on conflict (user_id) do nothing;

end $$;
