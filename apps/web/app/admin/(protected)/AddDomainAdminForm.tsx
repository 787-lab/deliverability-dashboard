"use client";

import { useState, type FormEvent } from "react";
import { adminAddDomain } from "./actions";
import type { ClientOption } from "@/lib/data";

export function AddDomainAdminForm({ clients }: { clients: ClientOption[] }) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [domainName, setDomainName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const result = await adminAddDomain(clientId, domainName);

    if (result.ok) {
      setDomainName("");
      setStatus("idle");
    } else {
      setErrorMessage(result.error);
      setStatus("error");
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-1 text-sm font-semibold text-foreground">Add a domain for a client</h2>
      <p className="mb-4 text-sm text-muted">
        Adds and marks the domain verified immediately — no TXT record needed for admin-added domains.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="rounded-md border border-border-strong px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
        >
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          required
          placeholder="mail.client.com"
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
          className="rounded-md border border-border-strong px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft sm:flex-1"
        />
        <button
          type="submit"
          disabled={status === "submitting" || !clientId}
          className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {status === "submitting" ? "Adding…" : "Add domain"}
        </button>
      </form>
      {status === "error" && <p className="mt-2 text-sm text-rose-600">{errorMessage}</p>}
    </div>
  );
}
