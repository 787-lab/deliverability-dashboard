"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = getBrowserSupabase();
    void supabase.auth.getUser().then(({ data }) => setHasSession(Boolean(data.user)));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords do not match.");
      return;
    }

    setStatus("submitting");
    try {
      const { error } = await getBrowserSupabase().auth.updateUser({ password });
      if (error) throw error;
      setStatus("success");
      window.setTimeout(() => {
        router.replace("/portal");
        router.refresh();
      }, 900);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "We could not update your password. Please request a new link.");
    }
  }

  if (hasSession === false) {
    return (
      <div className="app-card mx-auto mt-12 max-w-md p-7 text-center sm:p-8">
        <p className="eyebrow">Link required</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-.03em] text-foreground">Request a new password link</h1>
        <p className="mt-3 text-sm leading-6 text-muted">This link is invalid or expired. Request a fresh secure link to continue.</p>
        <Link href="/portal/forgot-password" className="primary-button mt-6 w-full">Request new link</Link>
      </div>
    );
  }

  return (
    <div className="app-card mx-auto mt-12 max-w-md p-7 sm:p-8">
      <p className="eyebrow">Secure account</p>
      <h1 className="mt-2 text-2xl font-bold tracking-[-.03em] text-foreground">Choose a new password</h1>
      <p className="mb-6 mt-2 text-sm leading-6 text-muted">Use at least 8 characters. Your new password will work for future sign-ins.</p>

      {hasSession === null ? <p className="text-sm text-muted">Checking your secure link…</p> : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-foreground">New password</span>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="field pr-16" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-muted hover:text-foreground">{showPassword ? "Hide" : "Show"}</button>
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-foreground">Confirm new password</span>
            <input type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="field" />
          </label>
          <button type="submit" disabled={status === "submitting" || status === "success"} className="primary-button w-full py-3">
            {status === "submitting" ? "Saving…" : status === "success" ? "Password updated ✓" : "Save new password"}
          </button>
          {status === "error" && <p role="alert" className="rounded-lg bg-rose-50 px-3.5 py-3 text-sm text-rose-700">{errorMessage}</p>}
        </form>
      )}
    </div>
  );
}
