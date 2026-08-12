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
    <div className="app-card p-6 sm:p-7">
      <p className="eyebrow">Expand monitoring</p><h2 className="mt-2 text-lg font-bold text-foreground">Add a sending domain</h2>
      <p className="mb-5 mt-1 text-sm text-muted">Connect a domain now. We’ll guide you through ownership verification next.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          required
          placeholder="mail.yourcompany.com"
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
          className="field sm:flex-1"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="primary-button shrink-0 disabled:opacity-50"
        >
          {status === "submitting" ? "Adding…" : "Add domain"}
        </button>
      </form>
      {status === "error" && <p className="mt-2 text-sm text-rose-600">{errorMessage}</p>}
    </div>
  );
}
