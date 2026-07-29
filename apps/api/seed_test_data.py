from __future__ import annotations

from app.db import get_client


def main() -> None:
    client = get_client()

    client_row = client.table("clients").insert({"name": "Test Client", "contact_email": "test@example.com"}).execute().data[0]
    print(f"created client: {client_row['id']} ({client_row['name']})")

    domain_row = (
        client.table("domains")
        .insert(
            {
                "client_id": client_row["id"],
                "domain_name": "github.com",
                "dkim_selector": "google",
            }
        )
        .execute()
        .data[0]
    )
    print(f"created domain: {domain_row['id']} ({domain_row['domain_name']})")
    print(f"\nrun: python3 store_check_results.py {domain_row['id']}")


if __name__ == "__main__":
    main()
