from __future__ import annotations

from app.db import get_client
from app.workers.dkim import DKIMResult, check_dkim
from app.workers.dmarc import check_dmarc
from app.workers.domain_reputation import check_domain_reputation
from app.workers.spf import check_spf

# Tried in order for any domain with no dkim_selector set on record. The
# first one that actually has a DKIM TXT record wins — a manually-set
# selector always takes priority over guessing.
COMMON_DKIM_SELECTORS = ["google", "selector1", "selector2", "s1", "default", "k1", "dkim", "mail"]


def _find_dkim_result(domain_name: str, dkim_selector: str | None) -> tuple[DKIMResult | None, str | None]:
    if dkim_selector:
        return check_dkim(domain_name, dkim_selector), dkim_selector

    for candidate in COMMON_DKIM_SELECTORS:
        result = check_dkim(domain_name, candidate)
        if result.record is not None:
            return result, candidate

    return None, None


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

    dkim, used_selector = _find_dkim_result(domain_name, dkim_selector)
    if dkim is not None:
        rows.append(
            {
                "domain_id": domain_id,
                "monitor_type": "dkim",
                "status": dkim.status,
                "score": dkim.key_bits,
                "details": {
                    "record": dkim.record,
                    "errors": dkim.errors,
                    "selector": used_selector,
                    "selector_auto_detected": dkim_selector is None,
                },
            }
        )
    # else: no dkim_selector on record and none of the common guesses had a
    # DKIM TXT record — no row inserted, so it reads as "no data" rather
    # than a false "fail" (we're not certain DKIM should exist there).

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
