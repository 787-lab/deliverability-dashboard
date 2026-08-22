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
      options: { emailRedirectTo: `${window.location.origin}/portal/auth/callback?next=${encodeURIComponent("/admin")}` },
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
      <div className="app-card mx-auto mt-12 max-w-md p-7 text-center sm:p-8"><div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">✓</div>
        <h1 className="mb-2 text-xl font-bold text-foreground">Check your email</h1>
        <p className="text-sm text-muted">
          We sent a login link to <strong className="text-foreground">{email}</strong>. Click it to sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="app-card mx-auto mt-12 max-w-md p-7 sm:p-8"><p className="eyebrow">Secure access</p>
      <h1 className="mb-2 mt-2 text-2xl font-bold tracking-[-.03em] text-foreground">Admin sign in</h1><p className="mb-6 text-sm text-muted">Enter your advazon. email to receive a secure login link.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="you@advazon.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="primary-button w-full disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send login link"}
        </button>
        {status === "error" && <p className="text-sm text-rose-600">{errorMessage}</p>}
      </form>
    </div>
  );
}
