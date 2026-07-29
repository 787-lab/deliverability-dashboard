from __future__ import annotations

import base64
import re
from dataclasses import dataclass, field

import dns.exception
import dns.resolver
from cryptography.hazmat.primitives.serialization import load_der_public_key

MIN_ACCEPTABLE_BITS = 1024
RECOMMENDED_BITS = 2048

_resolver = dns.resolver.Resolver()
_resolver.nameservers = ["8.8.8.8", "1.1.1.1"]
_resolver.timeout = 3
_resolver.lifetime = 6


@dataclass
class DKIMResult:
    status: str  # pass | warning | fail
    key_bits: int | None
    record: str | None
    errors: list[str] = field(default_factory=list)


def check_dkim(domain: str, selector: str) -> DKIMResult:
    query_name = f"{selector}._domainkey.{domain}"

    try:
        answers = _resolver.resolve(query_name, "TXT")
    except dns.exception.DNSException:
        return DKIMResult(status="fail", key_bits=None, record=None, errors=[f"no DKIM record at {query_name}"])

    record = "".join(b"".join(rdata.strings).decode("utf-8", errors="ignore") for rdata in answers)

    match = re.search(r"p=([A-Za-z0-9+/=]*)", record)
    if not match or not match.group(1):
        return DKIMResult(status="fail", key_bits=None, record=record, errors=["DKIM key is empty or revoked (p= is blank)"])

    try:
        key_der = base64.b64decode(match.group(1))
        public_key = load_der_public_key(key_der)
        key_bits = public_key.key_size
    except Exception as e:
        return DKIMResult(status="fail", key_bits=None, record=record, errors=[f"could not parse public key: {e}"])

    if key_bits < MIN_ACCEPTABLE_BITS:
        status = "fail"
    elif key_bits < RECOMMENDED_BITS:
        status = "warning"
    else:
        status = "pass"

    return DKIMResult(status=status, key_bits=key_bits, record=record, errors=[])
