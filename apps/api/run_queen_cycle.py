from __future__ import annotations

import json

from app.queen.cycle import run_cycle

if __name__ == "__main__":
    print(json.dumps(run_cycle(), indent=2))
