-- Links a client record to the Supabase Auth user who manages it, so the
-- self-serve portal can resolve "which company does this logged-in person
-- belong to." Nullable + not unique-enforced on null: existing clients
-- (seeded manually) have no linked user yet.
alter table clients
  add column user_id uuid references auth.users(id) on delete set null;

create unique index clients_user_id_key on clients(user_id) where user_id is not null;

-- ---------------------------------------------------------------------------
-- Row-level security: RLS was off for both tables, meaning any request made
-- with a logged-in user's session (as opposed to the admin dashboard's
-- service-role key, which bypasses RLS) could read every client's data, not
-- just their own. Turning it on now, scoped by the user_id link above.
--
-- Read-only for now — insert/update policies for self-serve domain
-- creation land alongside the endpoint that needs them.
-- ---------------------------------------------------------------------------
alter table clients enable row level security;
alter table domains enable row level security;

create policy "clients can read own row"
  on clients for select
  using (user_id = auth.uid());

create policy "clients can read own domains"
  on domains for select
  using (
    client_id in (select id from clients where user_id = auth.uid())
  );
