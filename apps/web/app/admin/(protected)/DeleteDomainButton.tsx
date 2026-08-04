"use client";

import { useState } from "react";
import { adminDeleteDomain } from "./actions";

export function DeleteDomainButton({ domainId, domainName }: { domainId: string; domainName: string }) {
  const [state, setState] = useState<"idle" | "confirming" | "deleting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleConfirm() {
    setState("deleting");
    setErrorMessage("");

    const result = await adminDeleteDomain(domainId);

    if (!result.ok) {
      setErrorMessage(result.error);
      setState("error");
    }
    // On success the row disappears once the page revalidates — nothing
    // else to do here.
  }

  if (state === "confirming" || state === "deleting" || state === "error") {
    return (
      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
        {state === "error" ? (
          <span className="text-xs text-rose-600">{errorMessage}</span>
        ) : (
          <span className="text-xs text-muted">Delete {domainName} and its history?</span>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={state === "deleting"}
          className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
        >
          {state === "deleting" ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => setState("idle")}
          disabled={state === "deleting"}
          className="rounded-md border border-border-strong px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-background disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => setState("confirming")}
        aria-label={`Delete ${domainName}`}
        className="flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-rose-50 hover:text-rose-600"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" strokeWidth={1.75}>
          <path
            d="M4 6h12M8 6V4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V6m2 0-.6 9.4a1.5 1.5 0 0 1-1.5 1.4H7.1a1.5 1.5 0 0 1-1.5-1.4L5 6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
