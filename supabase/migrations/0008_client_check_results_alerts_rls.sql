-- check_results and alerts had no row-level security at all — any logged-in
-- client could read every other client's domain data through these tables,
-- not just their own. Only the admin dashboard has ever queried them (via
-- the service-role key, which bypasses RLS regardless), so this was never
-- exercised until the client portal needed to read its own check results
-- too. Lock both down the same way domains already is (0004).
alter table check_results enable row level security;
alter table alerts enable row level security;

create policy "clients can read own check results"
  on check_results for select
  using (
    domain_id in (
      select id from domains
      where client_id in (select id from clients where user_id = auth.uid())
    )
  );

create policy "clients can read own alerts"
  on alerts for select
  using (
    domain_id in (
      select id from domains
      where client_id in (select id from clients where user_id = auth.uid())
    )
  );

-- Views run with the view owner's privileges by default (not the querying
-- role), which would bypass the RLS policy above entirely when queried
-- through latest_check_results. security_invoker makes it respect RLS on
-- the underlying check_results table for whoever is actually querying.
alter view latest_check_results set (security_invoker = true);
