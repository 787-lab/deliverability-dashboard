from __future__ import annotations

from typing import Optional

from fastapi import FastAPI, Header, HTTPException

from app.config import CHECK_API_SECRET
from app.db import get_client
from app.dispatch.run import dispatch_pending_alerts
from app.queen.alerts import process_alerts
from app.workers.runner import run_and_store

app = FastAPI()


def _require_secret(x_check_secret: str | None) -> None:
    if not CHECK_API_SECRET:
        raise HTTPException(status_code=500, detail="CHECK_API_SECRET not configured on server")
    if x_check_secret != CHECK_API_SECRET:
        raise HTTPException(status_code=401, detail="Invalid or missing X-Check-Secret header")


@app.post("/domains/{domain_id}/check")
def check_domain_now(domain_id: str, x_check_secret: Optional[str] = Header(default=None)) -> dict:
    """Runs the same SPF/DKIM/DMARC/reputation check the nightly cron runs,
    for a single domain, on demand. Used by the web app's "Check Now"
    buttons and by the auto-check that fires right after a client adds a
    new domain, so they don't have to wait for the next scheduled cycle."""
    _require_secret(x_check_secret)

    client = get_client()
    response = (
        client.table("domains")
        .select("id, domain_name, dkim_selector, is_active")
        .eq("id", domain_id)
        .maybe_single()
        .execute()
    )
    domain = response.data if response is not None else None

    if domain is None:
        raise HTTPException(status_code=404, detail="Domain not found")
    if not domain["is_active"]:
        raise HTTPException(status_code=409, detail="Domain is not active")

    results = run_and_store(
        domain_id=domain["id"],
        domain_name=domain["domain_name"],
        dkim_selector=domain.get("dkim_selector"),
    )
    actions = process_alerts(domain["id"], results)
    dispatch = dispatch_pending_alerts()

    return {"domain_id": domain["id"], "domain_name": domain["domain_name"], "actions": actions, "dispatch": dispatch}
