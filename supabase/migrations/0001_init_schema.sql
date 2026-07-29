-- Deliverability Dashboard — Phase 1 schema
-- Tables: clients, domains, check_results, alerts

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- clients: Advazon's subscribing customers
-- ---------------------------------------------------------------------------
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  subscription_tier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- domains: sending domains being monitored, one client can have several
-- ---------------------------------------------------------------------------
create table domains (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  domain_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, domain_name)
);

create index domains_client_id_idx on domains(client_id);

-- ---------------------------------------------------------------------------
-- check_results: one row per worker run per domain
-- "details" holds monitor-specific fields (e.g. SPF lookup count, DKIM
-- selector, blacklist name) as JSON so each monitor type doesn't need its
-- own table.
-- ---------------------------------------------------------------------------
create table check_results (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references domains(id) on delete cascade,
  monitor_type text not null check (
    monitor_type in ('spf', 'dkim', 'dmarc', 'inbox_placement', 'domain_reputation', 'warmup')
  ),
  status text not null check (status in ('pass', 'warning', 'fail', 'unknown')),
  score numeric,
  details jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now()
);

-- Fast lookup of "latest result per domain per monitor" for the dashboard
create index check_results_domain_monitor_idx
  on check_results(domain_id, monitor_type, checked_at desc);

-- ---------------------------------------------------------------------------
-- alerts: fired by the queen agent when a check_result crosses a threshold
-- or changes status
-- ---------------------------------------------------------------------------
create table alerts (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references domains(id) on delete cascade,
  check_result_id uuid references check_results(id) on delete set null,
  monitor_type text not null check (
    monitor_type in ('spf', 'dkim', 'dmarc', 'inbox_placement', 'domain_reputation', 'warmup')
  ),
  severity text not null check (severity in ('critical', 'warning')),
  message text not null,
  status text not null default 'open' check (status in ('open', 'acknowledged', 'resolved')),
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index alerts_domain_status_idx on alerts(domain_id, status);

-- ---------------------------------------------------------------------------
-- keep updated_at current on edit
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_set_updated_at
  before update on clients
  for each row execute function set_updated_at();

create trigger domains_set_updated_at
  before update on domains
  for each row execute function set_updated_at();
