from __future__ import annotations

from app.db import get_client
from app.workers.dkim import check_dkim
from app.workers.dmarc import check_dmarc
from app.workers.domain_reputation import check_domain_reputation
from app.workers.spf import check_spf


def run_and_store(domain_id: str, domain_name: str, dkim_selector: str | None) -> list[dict]:
    client = get_client()
    rows: list[dict] = []

    spf = check_spf(domain_name)
    rows.append(
        {
            "domain_id": domain_id,
            "monitor_type": "spf",
            "status": spf.status,
            "details": {"lookup_count": spf.lookup_count, "record": spf.record, "errors": spf.errors},
        }
    )

    dmarc = check_dmarc(domain_name)
    rows.append(
        {
            "domain_id": domain_id,
            "monitor_type": "dmarc",
            "status": dmarc.status,
            "details": {
                "policy": dmarc.policy,
                "subdomain_policy": dmarc.subdomain_policy,
                "pct": dmarc.pct,
                "rua": dmarc.rua,
                "ruf": dmarc.ruf,
                "record": dmarc.record,
                "errors": dmarc.errors,
            },
        }
    )

    if dkim_selector:
        dkim = check_dkim(domain_name, dkim_selector)
        rows.append(
            {
                "domain_id": domain_id,
                "monitor_type": "dkim",
                "status": dkim.status,
                "score": dkim.key_bits,
                "details": {"record": dkim.record, "errors": dkim.errors},
            }
        )

    reputation = check_domain_reputation(domain_name)
    rows.append(
        {
            "domain_id": domain_id,
            "monitor_type": "domain_reputation",
            "status": reputation.status,
            "details": {"listed_on": reputation.listed_on, "errors": reputation.errors},
        }
    )

    inserted = client.table("check_results").insert(rows).execute()
    return inserted.data
