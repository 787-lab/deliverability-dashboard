from __future__ import annotations

from dataclasses import dataclass, field

import dns.exception
import dns.resolver

MAX_LOOKUPS = 10

_resolver = dns.resolver.Resolver()
_resolver.nameservers = ["8.8.8.8", "1.1.1.1"]
_resolver.timeout = 3
_resolver.lifetime = 6


@dataclass
class SPFResult:
    status: str  # pass | warning | fail
    lookup_count: int
    record: str | None
    errors: list[str] = field(default_factory=list)


def _get_spf_record(domain: str) -> str | None:
    try:
        answers = _resolver.resolve(domain, "TXT")
    except dns.exception.DNSException:
        return None

    spf_records = []
    for rdata in answers:
        txt = b"".join(rdata.strings).decode("utf-8", errors="ignore")
        if txt.startswith("v=spf1"):
            spf_records.append(txt)

    if not spf_records:
        return None
    if len(spf_records) > 1:
        raise ValueError(f"{domain} has {len(spf_records)} SPF records — RFC 7208 allows only one")
    return spf_records[0]


def _count_lookups(domain: str, visited: set[str], depth: int = 0) -> tuple[int, list[str]]:
    if depth > MAX_LOOKUPS or domain in visited:
        return 0, []
    visited.add(domain)

    try:
        record = _get_spf_record(domain)
    except ValueError as e:
        return 0, [str(e)]

    if record is None:
        return 0, [f"no SPF record on {domain}"]

    count = 0
    errors: list[str] = []
    for term in record.split()[1:]:  # skip leading "v=spf1"
        t = term.lower().lstrip("+-~?")
        if t.startswith("include:"):
            count += 1
            nested_count, nested_errors = _count_lookups(t.split(":", 1)[1], visited, depth + 1)
            count += nested_count
            errors.extend(nested_errors)
        elif t == "a" or t.startswith(("a:", "a/")):
            count += 1
        elif t == "mx" or t.startswith(("mx:", "mx/")):
            count += 1
        elif t.startswith("ptr"):
            count += 1
        elif t.startswith("exists:"):
            count += 1
        elif t.startswith("redirect="):
            count += 1
            nested_count, nested_errors = _count_lookups(t.split("=", 1)[1], visited, depth + 1)
            count += nested_count
            errors.extend(nested_errors)

    return count, errors


def check_spf(domain: str) -> SPFResult:
    try:
        record = _get_spf_record(domain)
    except ValueError as e:
        return SPFResult(status="fail", lookup_count=0, record=None, errors=[str(e)])

    if record is None:
        return SPFResult(status="fail", lookup_count=0, record=None, errors=["no SPF record found"])

    lookup_count, errors = _count_lookups(domain, set())

    if lookup_count > MAX_LOOKUPS:
        status = "fail"
        errors.append(f"{lookup_count} DNS lookups exceeds RFC 7208 limit of {MAX_LOOKUPS}")
    elif errors:
        status = "warning"
    else:
        status = "pass"

    return SPFResult(status=status, lookup_count=lookup_count, record=record, errors=errors)
