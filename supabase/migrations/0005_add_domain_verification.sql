-- Verification support for self-serve domain connect: a client submits a
-- domain name, gets back a TXT record containing verification_token, adds
-- it to their DNS, and the verify step (a later migration/endpoint)
-- confirms it's live before the domain starts getting monitored.
--
-- verification_token auto-generates via the column default (pgcrypto's
-- gen_random_bytes, already enabled in 0001) so callers never need to
-- invent one themselves — insert the domain, read the token back.
alter table domains
  add column verification_token text not null default encode(gen_random_bytes(16), 'hex'),
  add column is_verified boolean not null default false,
  add column verified_at timestamptz;

-- Domains added manually before self-serve existed were already trusted
-- (added directly by Advazon via Supabase) — backfill them as verified so
-- the upcoming "unverified domains are excluded from monitoring" gate
-- doesn't suddenly stop checking domains that were already live.
update domains set is_verified = true, verified_at = created_at where is_verified = false;
