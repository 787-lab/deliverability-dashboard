"use client";

import { useState, type FormEvent } from "react";
import { adminAddClient } from "./actions";

export function AddClientAdminForm() {
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const result = await adminAddClient(name, contactEmail);

    if (result.ok) {
      setName("");
      setContactEmail("");
      setStatus("idle");
    } else {
      setErrorMessage(result.error);
      setStatus("error");
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-1 text-sm font-semibold text-foreground">Add a client</h2>
      <p className="mb-4 text-sm text-muted">
        They log in at /portal/login with this email — it links to this client automatically on first login.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          required
          placeholder="Client name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-border-strong px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft sm:w-48"
        />
        <input
          type="email"
          required
          placeholder="contact@client.com"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="rounded-md border border-border-strong px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft sm:flex-1"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {status === "submitting" ? "Adding…" : "Add client"}
        </button>
      </form>
      {status === "error" && <p className="mt-2 text-sm text-rose-600">{errorMessage}</p>}
    </div>
  );
}
