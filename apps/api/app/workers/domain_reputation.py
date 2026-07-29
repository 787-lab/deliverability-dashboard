from __future__ import annotations

from dataclasses import dataclass, field

import dns.exception
import dns.resolver

_resolver = dns.resolver.Resolver()
_resolver.nameservers = ["8.8.8.8", "1.1.1.1"]
_resolver.timeout = 3
_resolver.lifetime = 6

# Domain-based blacklists — these check the domain name itself (not a
# sending IP), queried the same way as any DNSBL: append the domain to the
# zone and see if it resolves.
BLACKLISTS = [
    ("spamhaus_dbl", "dbl.spamhaus.org"),
    ("surbl", "multi.surbl.org"),
    ("uribl", "multi.uribl.com"),
]


@dataclass
class DomainReputationResult:
    status: str  # pass | warning | fail
    listed_on: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


def _check_zone(domain: str, zone: str) -> tuple[bool, str | None]:
    query_name = f"{domain}.{zone}"
    try:
        answers = _resolver.resolve(query_name, "A")
        return True, ", ".join(str(rdata) for rdata in answers)
    except dns.resolver.NXDOMAIN:
        return False, None


def check_domain_reputation(domain: str) -> DomainReputationResult:
    listed_on: list[str] = []
    errors: list[str] = []

    for name, zone in BLACKLISTS:
        try:
            listed, code = _check_zone(domain, zone)
            if listed:
                listed_on.append(f"{name} ({code})")
        except dns.exception.DNSException as e:
            errors.append(f"{name} lookup failed: {e}")

    if listed_on:
        status = "fail"
    elif errors and len(errors) == len(BLACKLISTS):
        status = "warning"
        errors.append("could not confirm status on any blacklist (all lookups failed)")
    else:
        status = "pass"

    return DomainReputationResult(status=status, listed_on=listed_on, errors=errors)
