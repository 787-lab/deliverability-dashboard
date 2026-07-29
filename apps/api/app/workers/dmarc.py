from __future__ import annotations

from dataclasses import dataclass, field

import dns.exception
import dns.resolver

_resolver = dns.resolver.Resolver()
_resolver.nameservers = ["8.8.8.8", "1.1.1.1"]
_resolver.timeout = 3
_resolver.lifetime = 6


@dataclass
class DMARCResult:
    status: str  # pass | warning | fail
    policy: str | None
    subdomain_policy: str | None
    pct: int
    rua: list[str] = field(default_factory=list)
    ruf: list[str] = field(default_factory=list)
    record: str | None = None
    errors: list[str] = field(default_factory=list)


def _parse_tags(record: str) -> dict[str, str]:
    tags = {}
    for part in record.split(";"):
        part = part.strip()
        if not part or "=" not in part:
            continue
        key, value = part.split("=", 1)
        tags[key.strip().lower()] = value.strip()
    return tags


def check_dmarc(domain: str) -> DMARCResult:
    query_name = f"_dmarc.{domain}"

    try:
        answers = _resolver.resolve(query_name, "TXT")
    except dns.exception.DNSException:
        return DMARCResult(status="fail", policy=None, subdomain_policy=None, pct=0, errors=[f"no DMARC record at {query_name}"])

    record = None
    for rdata in answers:
        txt = b"".join(rdata.strings).decode("utf-8", errors="ignore")
        if txt.startswith("v=DMARC1"):
            record = txt
            break

    if record is None:
        return DMARCResult(status="fail", policy=None, subdomain_policy=None, pct=0, errors=["no valid DMARC record found"])

    tags = _parse_tags(record)
    policy = tags.get("p")
    subdomain_policy = tags.get("sp", policy)
    pct = int(tags.get("pct", "100"))
    rua = tags.get("rua", "").split(",") if tags.get("rua") else []
    ruf = tags.get("ruf", "").split(",") if tags.get("ruf") else []

    errors: list[str] = []
    if policy is None:
        status = "fail"
        errors.append("missing p= policy tag")
    elif policy == "none":
        status = "warning"
        errors.append("policy is 'none' (monitoring only, not enforced)")
    elif pct < 100:
        status = "warning"
        errors.append(f"pct={pct}, only partial enforcement")
    else:
        status = "pass"

    return DMARCResult(
        status=status,
        policy=policy,
        subdomain_policy=subdomain_policy,
        pct=pct,
        rua=rua,
        ruf=ruf,
        record=record,
        errors=errors,
    )
