"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

type AuthMode = "signin" | "signup";
type FormStatus = "idle" | "submitting" | "confirmation" | "existing" | "error";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isSignUp = mode === "signup";
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (isSignUp && password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords do not match.");
      return;
    }

    setStatus("submitting");

    try {
      const supabase = getBrowserSupabase();

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/portal/auth/callback`,
            data: { company_name: companyName.trim() },
          },
        });

        if (error) throw error;

        // With email confirmation enabled, Supabase intentionally returns a
        // non-error response for an existing account. An empty identities
        // array is the documented signal that no new identity was created.
        if (data.user?.identities?.length === 0) {
          setStatus("existing");
          return;
        }

        if (!data.session) {
          setStatus("confirmation");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) throw error;
      }

      router.replace("/portal");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    }
  }

  if (status === "existing") {
    return (
      <div className="app-card mx-auto mt-12 max-w-md p-7 text-center sm:p-8">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-lg font-bold text-accent">i</div>
        <p className="eyebrow">Account already exists</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-.03em] text-foreground">Use your existing account</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          <strong className="text-foreground">{email}</strong> is already registered. No duplicate account was created.
        </p>
        <div className="mt-6 grid gap-3">
          <Link href="/portal/login" className="primary-button w-full">Sign in</Link>
          <Link href={`/portal/forgot-password?email=${encodeURIComponent(email)}`} className="secondary-button w-full">Reset or set password</Link>
        </div>
      </div>
    );
  }

  if (status === "confirmation") {
    return (
      <div className="app-card mx-auto mt-12 max-w-md p-7 text-center sm:p-8">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-700">✓</div>
        <p className="eyebrow">Account created</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-.03em] text-foreground">Confirm your email</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Confirm it once, then sign in with your password.
        </p>
        <Link href="/portal/login" className="secondary-button mt-6 w-full">Return to sign in</Link>
      </div>
    );
  }

  return (
    <div className="app-card mx-auto mt-12 max-w-md overflow-hidden">
      <div className="grid grid-cols-2 border-b border-border bg-slate-50/80 p-1.5">
        <Link
          href="/portal/login"
          className={`rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${!isSignUp ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
        >
          Sign in
        </Link>
        <Link
          href="/portal/signup"
          className={`rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${isSignUp ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
        >
          Sign up
        </Link>
      </div>

      <div className="p-7 sm:p-8">
        <p className="eyebrow">Client portal</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-.03em] text-foreground">
          {isSignUp ? "Create your workspace" : "Welcome back"}
        </h1>
        <p className="mb-6 mt-2 text-sm leading-6 text-muted">
          {isSignUp
            ? "Create an account to monitor domains, alerts and sender reputation."
            : "Sign in with the email and password connected to your workspace."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-foreground">Company name</span>
              <input
                type="text"
                required
                autoComplete="organization"
                placeholder="Your company"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className="field"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-foreground">Work email</span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold text-foreground">
              Password
              {!isSignUp && <Link href={`/portal/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="text-accent hover:underline">Forgot password?</Link>}
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder={isSignUp ? "At least 8 characters" : "Enter your password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-muted hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {isSignUp && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-foreground">Confirm password</span>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="field"
              />
            </label>
          )}

          <button type="submit" disabled={status === "submitting"} className="primary-button w-full py-3">
            {status === "submitting" ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
          </button>

          {status === "error" && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3.5 py-3 text-sm text-rose-700">{errorMessage}</p>
          )}
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-subtle">
          {isSignUp ? "Already have an account? " : "New to advazon. Deliverability? "}
          <Link href={isSignUp ? "/portal/login" : "/portal/signup"} className="font-semibold text-accent hover:underline">
            {isSignUp ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
