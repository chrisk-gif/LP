CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));

  insert into areas (user_id, slug, name, color, icon, sort_order, is_system) values
    (new.id, 'asplan-viak', 'Asplan Viak', '#2563eb', 'Briefcase', 0, true),
    (new.id, 'ytly',        'ytly.no',     '#7c3aed', 'Rocket',    1, true),
    (new.id, 'privat',      'Privat',      '#059669', 'Home',      2, true),
    (new.id, 'okonomi',     'Økonomi',     '#d97706', 'Wallet',    3, true),
    (new.id, 'trening',     'Trening',     '#dc2626', 'Dumbbell',  4, true);

  insert into user_preferences (user_id) values (new.id);

  return new;
end;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
