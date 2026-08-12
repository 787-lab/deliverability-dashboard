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
    <div className="app-card p-7 sm:p-8"><p className="eyebrow">First step</p>
      <h1 className="mb-2 mt-2 text-2xl font-bold tracking-[-.03em] text-foreground">Let&apos;s set up your workspace</h1>
      <p className="mb-6 text-sm text-muted">What&apos;s your company or client name?</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          autoFocus
          placeholder="Company name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="primary-button w-full disabled:opacity-50"
        >
          {status === "submitting" ? "Setting up…" : "Continue"}
        </button>
        {status === "error" && <p className="text-sm text-rose-600">{errorMessage}</p>}
      </form>
    </div>
  );
}
