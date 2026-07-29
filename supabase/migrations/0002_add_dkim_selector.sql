-- Add DKIM selector to domains (needed because DKIM selectors can't be
-- auto-discovered via DNS — you set it per domain based on the client's
-- ESP/mail provider, e.g. 'google', 'selector1', 's1')

alter table domains
  add column dkim_selector text;
