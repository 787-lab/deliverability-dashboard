from __future__ import annotations

from datetime import datetime, timezone

from app.db import get_client
from app.dispatch.email import send_alert_email


def dispatch_pending_alerts() -> dict:
    """Sends an email for every open alert that hasn't been emailed yet, then
    marks it as sent. Alerts get email_sent_at reset to null (by the queen)
    whenever they're first opened or their severity changes, so this picks up
    both new problems and status changes."""
    client = get_client()

    pending = (
        client.table("alerts")
        .select("*, domains(domain_name, clients(name, contact_email))")
        .eq("status", "open")
        .is_("email_sent_at", "null")
        .execute()
        .data
    )

    summary = {"sent": 0, "skipped_no_email": 0, "errors": []}

    for alert in pending:
        domain = alert.get("domains") or {}
        client_info = domain.get("clients") or {}
        contact_email = client_info.get("contact_email")
        domain_name = domain.get("domain_name", "unknown domain")

        if not contact_email:
            summary["skipped_no_email"] += 1
            continue

        subject = f"[{alert['severity'].upper()}] {alert['monitor_type'].upper()} issue on {domain_name}"
        body = (
            f"Domain: {domain_name}\n"
            f"Monitor: {alert['monitor_type'].upper()}\n"
            f"Severity: {alert['severity'].upper()}\n\n"
            f"{alert['message']}\n\n"
            f"— Deliverability Dashboard"
        )

        try:
            send_alert_email(contact_email, subject, body)
            client.table("alerts").update({"email_sent_at": datetime.now(timezone.utc).isoformat()}).eq(
                "id", alert["id"]
            ).execute()
            summary["sent"] += 1
        except Exception as e:
            summary["errors"].append(f"alert {alert['id']}: {e}")

    return summary
