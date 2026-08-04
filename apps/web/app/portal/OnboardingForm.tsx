"use client";

import { useState, type FormEvent } from "react";
import { createMyClient } from "./actions";

export function OnboardingForm() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const result = await createMyClient(name);

    if (!result.ok) {
      setErrorMessage(result.error);
      setStatus("error");
    }
    // On success the page revalidates and re-renders past onboarding —
    // nothing else to do here.
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h1 className="mb-2 text-lg font-semibold text-foreground">Welcome — let&apos;s get you set up</h1>
      <p className="mb-4 text-sm text-muted">What&apos;s your company or client name?</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          autoFocus
          placeholder="Company name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-border-strong px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {status === "submitting" ? "Setting up…" : "Continue"}
        </button>
        {status === "error" && <p className="text-sm text-rose-600">{errorMessage}</p>}
      </form>
    </div>
  );
}
