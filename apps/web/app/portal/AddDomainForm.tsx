"use client";

import { useState, type FormEvent } from "react";
import { addDomain } from "./actions";

export function AddDomainForm() {
  const [domainName, setDomainName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const result = await addDomain(domainName);

    if (result.ok) {
      setDomainName("");
      setStatus("idle");
    } else {
      setErrorMessage(result.error);
      setStatus("error");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Add a domain</h2>
      <p className="mb-4 text-sm text-muted">Connect a sending domain to start monitoring it.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          required
          placeholder="mail.yourcompany.com"
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
          className="rounded-md border border-border-strong px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft sm:flex-1"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {status === "submitting" ? "Adding…" : "Add domain"}
        </button>
      </form>
      {status === "error" && <p className="mt-2 text-sm text-rose-600">{errorMessage}</p>}
    </div>
  );
}
