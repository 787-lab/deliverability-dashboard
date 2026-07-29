from __future__ import annotations

import os

import httpx
from dotenv import load_dotenv

load_dotenv()

RESEND_API_URL = "https://api.resend.com/emails"


def send_alert_email(to_email: str, subject: str, body_text: str) -> dict:
    api_key = os.environ["RESEND_API_KEY"]
    from_email = os.environ["RESEND_FROM_EMAIL"]

    response = httpx.post(
        RESEND_API_URL,
        headers={"Authorization": f"Bearer {api_key}"},
        json={"from": from_email, "to": [to_email], "subject": subject, "text": body_text},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()
