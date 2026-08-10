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
    ("sem_fresh", "fresh.spameatingmonkey.net"),
    ("sem_uri", "uribl.spameatingmonkey.net"),
    ("sem_urired", "urired.spameatingmonkey.net"),
]


@dataclass
class DomainReputationResult:
    status: str  # pass | warning | fail
    listed_on: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


def _is_blocked_response(zone: str, code: str) -> bool:
    # Each of these DNSBLs returns a special sentinel IP — not a real listing
    # — when it detects the query came from a shared public resolver (e.g.
    # 8.8.8.8 / 1.1.1.1, which is what we use) instead of a dedicated one.
    # Treating that sentinel as "listed" is a well-documented false-positive
    # trap (Spamhaus, SURBL, and URIBL all document this behavior).
    if zone == "dbl.spamhaus.org":
        return code.startswith("127.255.255.")
    if zone in (
        "multi.surbl.org",
        "multi.uribl.com",
        "fresh.spameatingmonkey.net",
        "uribl.spameatingmonkey.net",
        "urired.spameatingmonkey.net",
    ):
        return code == "127.0.0.1"
    return False


def _check_zone(domain: str, zone: str) -> tuple[bool, bool, str | None]:
    """Returns (listed, blocked, code). `blocked` means the DNSBL rejected
    the query itself rather than answering about the domain, so it must not
    be counted as a listing."""
    query_name = f"{domain}.{zone}"
    try:
        answers = _resolver.resolve(query_name, "A")
        code = ", ".join(str(rdata) for rdata in answers)
        if _is_blocked_response(zone, code):
            return False, True, code
        return True, False, code
    except dns.resolver.NXDOMAIN:
        return False, False, None


def check_domain_reputation(domain: str) -> DomainReputationResult:
    listed_on: list[str] = []
    errors: list[str] = []

    for name, zone in BLACKLISTS:
        try:
            listed, blocked, code = _check_zone(domain, zone)
            if listed:
                listed_on.append(f"{name} ({code})")
            elif blocked:
                errors.append(f"{name}: query blocked (public resolver rate limit) — inconclusive")
        except dns.exception.DNSException as e:
            errors.append(f"{name} lookup failed: {e}")

    if listed_on:
        status = "fail"
    elif errors and len(errors) == len(BLACKLISTS):
        status = "warning"
        errors.append("could not confirm status on any blacklist (all lookups failed or were blocked)")
    else:
        status = "pass"

    return DomainReputationResult(status=status, listed_on=listed_on, errors=errors)
