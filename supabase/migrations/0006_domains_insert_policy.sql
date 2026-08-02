-- Allows a logged-in client to insert a domain row for themselves — needed
-- for the self-serve "add domain" action. Scoped the same way as the read
-- policies from 0004: only into a client_id that resolves back to their
-- own user_id, enforced at the database level regardless of what the
-- request claims.
create policy "clients can add own domains"
  on domains for insert
  with check (
    client_id in (select id from clients where user_id = auth.uid())
  );
