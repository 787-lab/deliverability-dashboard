from __future__ import annotations

import argparse
import json
from dataclasses import asdict

from app.workers.dkim import check_dkim
from app.workers.dmarc import check_dmarc
from app.workers.spf import check_spf


def main() -> None:
    parser = argparse.ArgumentParser(description="Run SPF/DKIM/DMARC checks for a domain")
    parser.add_argument("domain")
    parser.add_argument("--dkim-selector", help="DKIM selector, e.g. 'google' or 'default'")
    args = parser.parse_args()

    print(f"\n=== SPF: {args.domain} ===")
    print(json.dumps(asdict(check_spf(args.domain)), indent=2))

    print(f"\n=== DMARC: {args.domain} ===")
    print(json.dumps(asdict(check_dmarc(args.domain)), indent=2))

    if args.dkim_selector:
        print(f"\n=== DKIM: {args.domain} (selector={args.dkim_selector}) ===")
        print(json.dumps(asdict(check_dkim(args.domain, args.dkim_selector)), indent=2))
    else:
        print("\n=== DKIM: skipped (pass --dkim-selector to check) ===")


if __name__ == "__main__":
    main()
