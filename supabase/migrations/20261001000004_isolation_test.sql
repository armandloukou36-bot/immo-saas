-- ============================================================
-- Second compte de test pour vérifier l'isolation RLS
-- Organisation distincte, qui ne doit voir AUCUNE donnée
-- de l'organisation de démonstration.
-- ============================================================

do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'isolation@test.ci';
  if v_user_id is not null then
    raise notice 'Le compte de test existe déjà';
    return;
  end if;

  v_user_id := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id, 'authenticated', 'authenticated',
    'isolation@test.ci',
    crypt('isolation123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"organization_name":"Agence Concurrente","full_name":"Test Isolation"}'::jsonb,
    '', '', '', ''
  );

  insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', 'isolation@test.ci'),
    'email', v_user_id::text, now(), now(), now()
  );

  -- Quelques données propres à cette seconde organisation
  insert into properties (organization_id, name, type, address, status)
  select p.organization_id, 'Bien Interne Concurrent', 'bureau', 'Zone Concurrente', 'disponible'
  from profiles p where p.id = v_user_id;
end $$;
