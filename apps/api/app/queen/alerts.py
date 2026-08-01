from __future__ import annotations

from datetime import datetime, timezone

from app.db import get_client


def _build_message(monitor_type: str, status: str, details: dict) -> str:
    parts = []
    if details.get("listed_on"):
        parts.append(f"listed on {', '.join(details['listed_on'])}")
    if details.get("errors"):
        parts.append("; ".join(details["errors"]))

    if parts:
        return f"{monitor_type.upper()} {status}: {' | '.join(parts)}"
    return f"{monitor_type.upper()} {status}"


def _severity_for(status: str) -> str:
    return "critical" if status == "fail" else "warning"


def process_alerts(domain_id: str, results: list[dict]) -> list[dict]:
    """Given freshly-inserted check_results rows for one domain, open, escalate,
    or resolve alerts. Only creates a new alert row when there isn't already an
    open one for that domain+monitor — avoids re-alerting on every cycle while
    a problem is still ongoing."""
    client = get_client()
    actions: list[dict] = []

    for result in results:
        monitor_type = result["monitor_type"]
        status = result["status"]
        details = result.get("details") or {}

        open_alert_rows = (
            client.table("alerts")
            .select("*")
            .eq("domain_id", domain_id)
            .eq("monitor_type", monitor_type)
            .eq("status", "open")
            .limit(1)
            .execute()
            .data
        )
        open_alert = open_alert_rows[0] if open_alert_rows else None

        if status in ("fail", "warning"):
            severity = _severity_for(status)
            message = _build_message(monitor_type, status, details)

            if open_alert is None:
                new_alert = (
                    client.table("alerts")
                    .insert(
                        {
                            "domain_id": domain_id,
                            "check_result_id": result["id"],
                            "monitor_type": monitor_type,
                            "severity": severity,
                            "message": message,
                            "status": "open",
                        }
                    )
                    .execute()
                    .data[0]
                )
                actions.append({"action": "opened", "alert": new_alert})
            elif open_alert["severity"] != severity:
                updated = (
                    client.table("alerts")
                    .update(
                        {
                            "severity": severity,
                            "check_result_id": result["id"],
                            "message": message,
                            "email_sent_at": None,
                        }
                    )
                    .eq("id", open_alert["id"])
                    .execute()
                    .data[0]
                )
                actions.append({"action": "escalated", "alert": updated})
            else:
                actions.append({"action": "unchanged", "alert": open_alert})

        else:  # status == "pass"
            if open_alert is not None:
                resolved = (
                    client.table("alerts")
                    .update({"status": "resolved", "resolved_at": datetime.now(timezone.utc).isoformat()})
                    .eq("id", open_alert["id"])
                    .execute()
                    .data[0]
                )
                actions.append({"action": "resolved", "alert": resolved})

    return actions
