# Deliverability Dashboard

Phase 1 build. Full plan in `docs/spec.md`.

## Structure

```
apps/web/       Next.js dashboard (client-facing UI) — not built yet
apps/api/       FastAPI queen + worker logic — not built yet
supabase/
  migrations/   SQL schema files, run these against your Supabase project
docs/spec.md    Original build spec
```

## Database setup (done so far)

`supabase/migrations/0001_init_schema.sql` creates 4 tables:

- **clients** — Advazon's subscribing customers
- **domains** — sending domains being monitored, linked to a client
- **check_results** — one row per worker run (SPF/DKIM/DMARC/etc.), with a
  flexible `details` JSON field since each monitor type checks different things
- **alerts** — fired when a check crosses a threshold, tracks severity and
  whether it's been resolved

### To apply it

1. Open your Supabase project → **SQL Editor**.
2. Paste the full contents of `supabase/migrations/0001_init_schema.sql`.
3. Click **Run**.
4. Confirm in **Table Editor** that `clients`, `domains`, `check_results`,
   `alerts` all appear.
