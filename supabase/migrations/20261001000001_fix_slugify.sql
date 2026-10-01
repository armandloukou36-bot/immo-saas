-- ============================================================
-- CORRECTIF : création d'utilisateur (slug d'organisation)
-- L'extension `unaccent` n'est pas disponible sur ce projet.
-- Les ligatures (æ, œ) sont développées, puis les paires 1:1
-- sont traitées par `translate` — tables de longueurs égales,
-- générées par programme pour éviter tout décalage.
-- ============================================================

create or replace function public.slugify(p_text text)
returns text
language sql
immutable
as $$
  select coalesce(
    nullif(
      trim(both '-' from
        regexp_replace(
          lower(
            translate(
              regexp_replace(regexp_replace(p_text, '[æÆ]', 'ae', 'g'), '[œŒ]', 'oe', 'g'),
              'àáâãäåāăąÀÁÂÃÄÅĀĂĄçćĉċčÇĆĈĊČèéêëēĕėęěÈÉÊËĒĔĖĘĚìíîïĩīĭįıÌÍÎÏĨĪĬĮIñńňÑŃŇòóôõöøōŏőÒÓÔÕÖØŌŎŐùúûüũūŭůűųÙÚÛÜŨŪŬŮŰŲýÿŷÝŸŶžźżŽŹŻšśşŠŚŞğġģĞĠĢłŁđðĐÐþÞ',
              'aaaaaaaaaaaaaaaaaacccccccccceeeeeeeeeeeeeeeeeeiiiiiiiiiiiiiiiiiinnnnnnoooooooooooooooooouuuuuuuuuuuuuuuuuuuuyyyyyyzzzzzzssssssggggggllddddpp'
            )
          ),
          '[^a-z0-9]+', '-', 'g'
        )
      ),
      ''
    ),
    'agence'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_name text;
  v_slug     text;
  v_base     text;
  v_org_id   uuid;
  v_n        int := 1;
begin
  v_org_name := coalesce(nullif(trim(new.raw_user_meta_data->>'organization_name'), ''), 'Mon organisation');
  v_base := public.slugify(v_org_name);

  v_slug := v_base;
  while exists (select 1 from public.organizations where slug = v_slug) loop
    v_slug := v_base || '-' || v_n;
    v_n := v_n + 1;
  end loop;

  insert into public.organizations (name, slug, plan, status)
  values (v_org_name, v_slug, 'free', 'active')
  returning id into v_org_id;

  insert into public.profiles (id, organization_id, email, full_name, role)
  values (
    new.id,
    v_org_id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), new.email),
    'admin'
  );

  insert into public.activity_log (organization_id, user_id, action, detail)
  values (v_org_id, new.id, 'Création de compte', 'Organisation « ' || v_org_name || ' » créée');

  return new;
end $$;
