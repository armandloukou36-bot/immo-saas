-- ============================================================
-- Création du compte de démonstration
-- Passe par auth.users directement pour éviter la limite d'envoi
-- d'emails. Le trigger on_auth_user_created crée ensuite
-- l'organisation et le profil.
-- ============================================================

do $$
declare
  v_user_id uuid;
begin
  -- Ne rien faire si le compte existe déjà
  select id into v_user_id from auth.users where email = 'demo@immo-saas.ci';
  if v_user_id is not null then
    raise notice 'Le compte de démonstration existe déjà';
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
    v_user_id,
    'authenticated',
    'authenticated',
    'demo@immo-saas.ci',
    crypt('demo1234', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"organization_name":"Mon Agence Immobilière","full_name":"Administrateur"}'::jsonb,
    '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', 'demo@immo-saas.ci'),
    'email',
    v_user_id::text,
    now(), now(), now()
  );
end $$;
