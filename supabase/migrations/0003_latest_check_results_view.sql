-- View that surfaces only the most recent check_result per domain per
-- monitor type — this is what the dashboard's "current status" view reads
-- instead of re-deriving it from the full history every time.

create view latest_check_results as
select distinct on (domain_id, monitor_type)
  id, domain_id, monitor_type, status, score, details, checked_at
from check_results
order by domain_id, monitor_type, checked_at desc;
