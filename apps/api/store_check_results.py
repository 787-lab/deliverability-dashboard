from __future__ import annotations

import argparse

from app.db import get_client
from app.workers.runner import run_and_store


def main() -> None:
    parser = argparse.ArgumentParser(description="Run SPF/DKIM/DMARC checks for a domain row and write results to Supabase")
    parser.add_argument("domain_id", help="UUID of the row in the domains table")
    args = parser.parse_args()

    client = get_client()
    domain_row = client.table("domains").select("*").eq("id", args.domain_id).single().execute().data

    if not domain_row:
        print(f"no domain found with id {args.domain_id}")
        return

    inserted = run_and_store(
        domain_id=domain_row["id"],
        domain_name=domain_row["domain_name"],
        dkim_selector=domain_row.get("dkim_selector"),
    )

    print(f"wrote {len(inserted)} check_results rows for {domain_row['domain_name']}:")
    for row in inserted:
        print(f"  {row['monitor_type']}: {row['status']}")


if __name__ == "__main__":
    main()
