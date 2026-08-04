from __future__ import annotations

from app.db import get_client
from app.dispatch.run import dispatch_pending_alerts
from app.queen.alerts import process_alerts
from app.workers.runner import run_and_store


def run_cycle() -> dict:
    client = get_client()
    # Verification (TXT record) is optional and doesn't gate monitoring —
    # a domain starts getting checked as soon as it's added. is_verified
    # only controls whether the client sees a "Verified" badge.
    domains = (
        client.table("domains")
        .select("*")
        .eq("is_active", True)
        .execute()
        .data
    )

    summary = {
        "domains_checked": 0,
        "alerts_opened": 0,
        "alerts_escalated": 0,
        "alerts_resolved": 0,
        "errors": [],
    }

    for domain in domains:
        try:
            results = run_and_store(
                domain_id=domain["id"],
                domain_name=domain["domain_name"],
                dkim_selector=domain.get("dkim_selector"),
            )
            actions = process_alerts(domain["id"], results)
            summary["domains_checked"] += 1
            for action in actions:
                if action["action"] == "opened":
                    summary["alerts_opened"] += 1
                elif action["action"] == "escalated":
                    summary["alerts_escalated"] += 1
                elif action["action"] == "resolved":
                    summary["alerts_resolved"] += 1
        except Exception as e:
            summary["errors"].append(f"{domain['domain_name']}: {e}")

    summary["dispatch"] = dispatch_pending_alerts()
    return summary
