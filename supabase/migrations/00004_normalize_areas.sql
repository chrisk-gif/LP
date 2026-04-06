-- =============================================================================
-- Migration 00004: Normalize areas to canonical set
-- Canonical areas: asplan-viak, ytly, privat, okonomi, trening
-- Migrates old slugs: jobb -> asplan-viak (if no asplan-viak), helse -> trening
-- Adds missing: ytly, trening
-- =============================================================================

-- Step 1: For users who have 'jobb' but NOT 'asplan-viak', rename jobb to asplan-viak
update areas
set slug = 'asplan-viak', name = 'Asplan Viak', icon = 'Briefcase', color = '#2563eb'
where slug = 'jobb'
  and user_id not in (
    select user_id from areas where slug = 'asplan-viak'
  );

-- Step 2: For users who have 'helse' but NOT 'trening', rename helse to trening
update areas
set slug = 'trening', name = 'Trening', icon = 'Dumbbell', color = '#dc2626'
where slug = 'helse'
  and user_id not in (
    select user_id from areas where slug = 'trening'
  );

-- Step 3: Delete leftover 'jobb' and 'helse' areas (after reassignment)
-- Only delete if user already has the canonical equivalent
delete from areas where slug = 'jobb'
  and user_id in (select user_id from areas where slug = 'asplan-viak');
delete from areas where slug = 'helse'
  and user_id in (select user_id from areas where slug = 'trening');

-- Step 4: Add missing 'ytly' area for all users who don't have it
insert into areas (user_id, slug, name, color, icon, sort_order, is_system)
select p.id, 'ytly', 'ytly.no', '#7c3aed', 'Rocket', 1, true
from profiles p
where not exists (
  select 1 from areas a where a.user_id = p.id and a.slug = 'ytly'
);

-- Step 5: Add missing 'trening' area for all users who don't have it
insert into areas (user_id, slug, name, color, icon, sort_order, is_system)
select p.id, 'trening', 'Trening', '#dc2626', 'Dumbbell', 4, true
from profiles p
where not exists (
  select 1 from areas a where a.user_id = p.id and a.slug = 'trening'
);

-- Step 6: Normalize sort_order and colors for canonical areas
update areas set sort_order = 0, color = coalesce(color, '#2563eb') where slug = 'asplan-viak';
update areas set sort_order = 1, color = coalesce(color, '#7c3aed') where slug = 'ytly';
update areas set sort_order = 2, color = coalesce(color, '#059669') where slug = 'privat';
update areas set sort_order = 3, color = coalesce(color, '#d97706') where slug = 'okonomi';
update areas set sort_order = 4, color = coalesce(color, '#dc2626') where slug = 'trening';

-- Step 7: Replace handle_new_user trigger to create canonical areas
create or replace function handle_new_user()
returns trigger as $$
declare
  new_profile_id uuid;
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  returning id into new_profile_id;

  insert into areas (user_id, slug, name, color, icon, sort_order, is_system) values
    (new_profile_id, 'asplan-viak', 'Asplan Viak',  '#2563eb', 'Briefcase', 0, true),
    (new_profile_id, 'ytly',        'ytly.no',      '#7c3aed', 'Rocket',    1, true),
    (new_profile_id, 'privat',      'Privat',       '#059669', 'Home',      2, true),
    (new_profile_id, 'okonomi',     'Økonomi',      '#d97706', 'Wallet',    3, true),
    (new_profile_id, 'trening',     'Trening',      '#dc2626', 'Dumbbell',  4, true);

  insert into user_preferences (user_id) values (new_profile_id);

  return new;
end;
$$ language plpgsql security definer;
