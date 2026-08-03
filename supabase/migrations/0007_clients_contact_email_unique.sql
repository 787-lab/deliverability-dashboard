-- Prevents two clients sharing a contact_email, which would make the
-- portal auth callback's "link this login to the client waiting for it"
-- update ambiguous (it matches by contact_email) and could link one
-- login to more than one client's domains.
create unique index clients_contact_email_key on clients(contact_email) where contact_email is not null;
