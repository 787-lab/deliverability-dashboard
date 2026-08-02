"use client";

import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/portal/auth/callback?next=${encodeURIComponent("/")}` },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="mx-auto mt-16 max-w-sm rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-foreground">Check your email</h1>
        <p className="text-sm text-muted">
          We sent a login link to <strong className="text-foreground">{email}</strong>. Click it to sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h1 className="mb-4 text-lg font-semibold text-foreground">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="you@advazon.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border-strong px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send login link"}
        </button>
        {status === "error" && <p className="text-sm text-rose-600">{errorMessage}</p>}
      </form>
    </div>
  );
}
