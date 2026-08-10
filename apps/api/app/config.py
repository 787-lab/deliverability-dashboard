from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

# Only required by app.server (the on-demand check HTTP endpoint), not by
# the cron scripts — those never import this.
CHECK_API_SECRET = os.environ.get("CHECK_API_SECRET")
