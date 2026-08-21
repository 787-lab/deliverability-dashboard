"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const supabase = getBrowserSupabase();
      const callback = new URL("/portal/auth/callback", window.location.origin);
      callback.searchParams.set("next", "/portal/reset-password");

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: callback.toString(),
      });

      if (error) throw error;
      setStatus("sent");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "We could not process your request. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="app-card mx-auto mt-12 max-w-md p-7 text-center sm:p-8">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-700">✓</div>
        <p className="eyebrow">Check your inbox</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-.03em] text-foreground">Password link requested</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          If an account exists for <strong className="text-foreground">{email}</strong>, we sent a secure password link. Check spam or promotions if it does not arrive shortly.
        </p>
        <Link href="/portal/login" className="secondary-button mt-6 w-full">Return to sign in</Link>
      </div>
    );
  }

  return (
    <div className="app-card mx-auto mt-12 max-w-md p-7 sm:p-8">
      <p className="eyebrow">Account access</p>
      <h1 className="mt-2 text-2xl font-bold tracking-[-.03em] text-foreground">Reset or set your password</h1>
      <p className="mb-6 mt-2 text-sm leading-6 text-muted">We will email a secure link to the address connected to your client workspace.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-foreground">Work email</span>
          <input type="email" required autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} className="field" />
        </label>
        <button type="submit" disabled={status === "submitting"} className="primary-button w-full py-3">
          {status === "submitting" ? "Sending…" : "Email password link"}
        </button>
        {status === "error" && <p role="alert" className="rounded-lg bg-rose-50 px-3.5 py-3 text-sm text-rose-700">{errorMessage}</p>}
      </form>

      <p className="mt-6 text-center text-xs text-subtle"><Link href="/portal/login" className="font-semibold text-accent hover:underline">Back to sign in</Link></p>
    </div>
  );
}
