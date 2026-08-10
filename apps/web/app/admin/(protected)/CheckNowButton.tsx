"use client";

import { useState } from "react";
import { adminCheckDomainNow } from "./actions";

export function CheckNowButton({ domainId }: { domainId: string }) {
  const [state, setState] = useState<"idle" | "checking" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleClick() {
    setState("checking");
    setErrorMessage("");

    const result = await adminCheckDomainNow(domainId);

    if (!result.ok) {
      setErrorMessage(result.error);
      setState("error");
      return;
    }
    setState("idle");
  }

  return (
    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
      {state === "error" && <span className="text-xs text-rose-600">{errorMessage}</span>}
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "checking"}
        className="rounded-md border border-border-strong px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-background disabled:opacity-50"
      >
        {state === "checking" ? "Checking…" : "Check now"}
      </button>
    </div>
  );
}
