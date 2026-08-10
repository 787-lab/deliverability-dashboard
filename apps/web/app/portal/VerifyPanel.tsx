"use client";

import { useState } from "react";
import { verifyDomain } from "./actions";
import { verificationTxtRecord } from "@/lib/domain-verification";
import { CheckNowButton } from "./CheckNowButton";

export function VerifyPanel({
  domainId,
  domainName,
  verificationToken,
}: {
  domainId: string;
  domainName: string;
  verificationToken: string;
}) {
  const [state, setState] = useState<"idle" | "checking" | "verified" | "pending" | "error">("idle");
  const [message, setMessage] = useState("");

  const { host, value } = verificationTxtRecord(domainName, verificationToken);

  async function handleVerify() {
    setState("checking");
    setMessage("");

    const result = await verifyDomain(domainId);

    if (!result.ok) {
      setState("error");
      setMessage(result.error);
    } else if (result.verified) {
      setState("verified");
    } else {
      setState("pending");
      setMessage(result.reason);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Verify {domainName}</h2>
          {state === "verified" && (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              Verified
            </span>
          )}
        </div>
        <CheckNowButton domainId={domainId} />
      </div>

      {state === "verified" ? (
        <p className="text-sm text-muted">DNS record confirmed. This domain will start being monitored shortly.</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            This domain is already being monitored. Add this TXT record and verify anytime to prove ownership
            and get the Verified badge — it&apos;s optional, not required for monitoring.
          </p>
          <dl className="space-y-3 rounded-md border border-border bg-background p-4 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-subtle">Type</dt>
              <dd className="font-mono text-foreground">TXT</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-subtle">Host</dt>
              <dd className="break-all font-mono text-foreground">{host}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-subtle">Value</dt>
              <dd className="break-all font-mono text-foreground">{value}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleVerify}
            disabled={state === "checking"}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {state === "checking" ? "Checking…" : "Verify"}
          </button>

          {state === "pending" && <p className="mt-2 text-sm text-amber-700">{message}</p>}
          {state === "error" && <p className="mt-2 text-sm text-rose-600">{message}</p>}
          {state === "idle" && (
            <p className="mt-2 text-xs text-subtle">DNS changes can take a few hours to propagate.</p>
          )}
        </>
      )}
    </div>
  );
}
