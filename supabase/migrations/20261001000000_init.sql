-- ============================================================
-- IMMO SAAS — Migration initiale PostgreSQL / Supabase
-- Convertit le schéma SQLite en Postgres avec RLS multi-tenant.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ORGANISATIONS
-- ============================================================
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'free' check (plan in ('free','basic','pro','enterprise')),
  status text not null default 'active' check (status in ('active','expired','cancelled','past_due')),
  address text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROFILS (prolonge auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'agent' check (role in ('admin','manager','agent','viewer')),
  enabled boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- BIENS
-- ============================================================
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  type text not null default 'appartement'
    check (type in ('villa','appartement','terrain','local','bureau','hotel','autre')),
  address text not null,
  city text,
  surface numeric(12,2),
  rooms integer,
  bedrooms integer,
  bathrooms integer,
  price numeric(15,2),
  rental_price numeric(15,2),
  status text not null default 'disponible'
    check (status in ('disponible','loué','en_negociation','vendu','reserve','en_construction')),
  featured boolean not null default false,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CLIENTS
-- ============================================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  type text not null default 'locataire'
    check (type in ('locataire','propriétaire','prospect','vendeur','autre')),
  full_name text not null,
  email text,
  phone text,
  address text,
  city text,
  status text not null default 'actif' check (status in ('actif','inactif','lead','negotiation')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- BAUX
-- ============================================================
create table if not exists public.leases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  reference text not null,
  property_id uuid references public.properties(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  start_date date not null,
  end_date date,
  monthly_rent numeric(15,2) not null default 0,
  deposit numeric(15,2) not null default 0,
  status text not null default 'active'
    check (status in ('active','pending','draft','terminated','expired')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FACTURES
-- ============================================================
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lease_id uuid references public.leases(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  invoice_number text not null,
  amount numeric(15,2) not null default 0,
  due_date date not null,
  paid_date date,
  status text not null default 'pending'
    check (status in ('pending','paid','overdue','cancelled','write_off')),
  recurrence text not null default 'monthly'
    check (recurrence in ('monthly','yearly','weekly','one-time')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PAIEMENTS
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete cascade,
  amount numeric(15,2) not null default 0,
  payment_date date not null default current_date,
  method text not null default 'cash'
    check (method in ('cash','bank_transfer','card','cheque','mobile_money','stripe','other')),
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RELANCES
-- ============================================================
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  type text not null default 'rent_reminder'
    check (type in ('rent_reminder','payment_reminder','recovery_notice','general')),
  subject text,
  message text,
  scheduled_date date not null,
  sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending','sent','failed','cancelled')),
  channel text not null default 'email' check (channel in ('email','sms','in_app','none')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- RECOUVREMENT
-- ============================================================
create table if not exists public.recovery_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  reference text not null,
  invoice_id uuid references public.invoices(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  amount_due numeric(15,2) not null default 0,
  opened_at timestamptz not null default now(),
  status text not null default 'open'
    check (status in ('open','investigating','notice_sent','legal_action','resolved','closed','waived')),
  assigned_to text,
  resolution text,
  notes text,
  closure_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- JOURNAL D'ACTIVITÉ
-- ============================================================
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEX
-- ============================================================
create index if not exists idx_profiles_org on public.profiles(organization_id);
create index if not exists idx_properties_org on public.properties(organization_id);
create index if not exists idx_clients_org on public.clients(organization_id);
create index if not exists idx_leases_org on public.leases(organization_id);
create index if not exists idx_invoices_org on public.invoices(organization_id);
create index if not exists idx_invoices_due on public.invoices(due_date);
create index if not exists idx_payments_invoice on public.payments(invoice_id);
create index if not exists idx_reminders_org on public.reminders(organization_id);
create index if not exists idx_recovery_org on public.recovery_cases(organization_id);
create index if not exists idx_activity_org on public.activity_log(organization_id);

-- ============================================================
-- FONCTION : organisation de l'utilisateur courant
-- ============================================================
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.clients enable row level security;
alter table public.leases enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.reminders enable row level security;
alter table public.recovery_cases enable row level security;
alter table public.activity_log enable row level security;

-- Organisations : lecture/écriture de la sienne
drop policy if exists org_self on public.organizations;
create policy org_self on public.organizations
  for all to authenticated
  using (id = public.current_org_id())
  with check (id = public.current_org_id());

-- Profils : ceux de la même organisation
drop policy if exists profiles_org on public.profiles;
create policy profiles_org on public.profiles
  for all to authenticated
  using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

-- Tables métier : isolation par organisation
do $$
declare t text;
begin
  foreach t in array array['properties','clients','leases','invoices','payments','reminders','recovery_cases','activity_log']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_org', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (organization_id = public.current_org_id()) with check (organization_id = public.current_org_id())',
      t || '_org', t
    );
  end loop;
end $$;

-- ============================================================
-- TRIGGER : horodatage updated_at
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['organizations','profiles','properties','clients','leases','invoices','recovery_cases']
  loop
    execute format('drop trigger if exists trg_touch_%s on public.%I', t, t);
    execute format('create trigger trg_touch_%s before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- ============================================================
-- TRIGGER : création automatique de l'organisation + profil
-- à l'inscription d'un utilisateur Supabase Auth
-- ============================================================
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

  -- Génère un slug unique à partir du nom d'organisation
  v_base := lower(regexp_replace(unaccent(v_org_name), '[^a-zA-Z0-9]+', '-', 'g'));
  v_base := trim(both '-' from v_base);
  if v_base = '' then v_base := 'agence'; end if;

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- FONCTIONS MÉTIER
-- ============================================================
create or replace function public.next_invoice_number(p_org uuid)
returns text language plpgsql stable as $$
declare
  v_year  int := extract(year from now());
  v_count int;
begin
  select count(*) into v_count
  from public.invoices
  where organization_id = p_org and invoice_number like 'INV-' || v_year || '-%';
  return 'INV-' || v_year || '-' || lpad((v_count + 1)::text, 4, '0');
end $$;

create or replace function public.next_lease_reference(p_org uuid)
returns text language plpgsql stable as $$
declare v_year int := extract(year from now()); v_count int;
begin
  select count(*) into v_count from public.leases where organization_id = p_org;
  return 'LE-' || v_year || '-' || lpad((v_count + 1)::text, 4, '0');
end $$;

create or replace function public.next_recovery_reference(p_org uuid)
returns text language plpgsql stable as $$
declare v_year int := extract(year from now()); v_count int;
begin
  select count(*) into v_count from public.recovery_cases where organization_id = p_org;
  return 'REC-' || v_year || '-' || lpad((v_count + 1)::text, 4, '0');
end $$;

-- ============================================================
-- VUES
-- ============================================================
create or replace view public.dashboard_stats
with (security_invoker = true) as
select
  (select count(*) from public.properties where organization_id = public.current_org_id()) as total_properties,
  (select count(*) from public.properties where organization_id = public.current_org_id() and status = 'disponible') as available_properties,
  (select count(*) from public.properties where organization_id = public.current_org_id() and status = 'loué') as leased_properties,
  (select count(*) from public.clients where organization_id = public.current_org_id()) as total_clients,
  (select count(*) from public.leases where organization_id = public.current_org_id() and status = 'active') as active_leases,
  (select count(*) from public.invoices where organization_id = public.current_org_id() and status = 'pending') as pending_invoices,
  (select count(*) from public.invoices where organization_id = public.current_org_id() and status = 'overdue') as overdue_invoices,
  (select coalesce(sum(amount), 0) from public.invoices where organization_id = public.current_org_id() and status = 'pending') as pending_amount,
  (select coalesce(sum(amount), 0) from public.invoices where organization_id = public.current_org_id() and status = 'overdue') as overdue_amount,
  (select count(*) from public.recovery_cases where organization_id = public.current_org_id()
     and status in ('open','investigating','notice_sent','legal_action')) as open_recovery_cases,
  (select coalesce(sum(amount_due), 0) from public.recovery_cases where organization_id = public.current_org_id()
     and status not in ('resolved','closed','waived')) as recovery_amount,
  (select count(*) from public.invoices where organization_id = public.current_org_id() and status = 'paid'
     and date_trunc('month', paid_date) = date_trunc('month', current_date)) as paid_this_month,
  (select coalesce(sum(amount), 0) from public.invoices where organization_id = public.current_org_id() and status = 'paid'
     and date_trunc('month', paid_date) = date_trunc('month', current_date)) as revenue_this_month;

-- ============================================================
-- PERMISSIONS
-- ============================================================
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
