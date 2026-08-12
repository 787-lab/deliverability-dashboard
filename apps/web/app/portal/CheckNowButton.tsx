"use client";

import { useState } from "react";
import { checkMyDomainNow } from "./actions";

export function CheckNowButton({ domainId }: { domainId: string }) {
  const [state, setState] = useState<"idle" | "checking" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleClick() {
    setState("checking");
    setErrorMessage("");

    const result = await checkMyDomainNow(domainId);

    if (!result.ok) {
      setErrorMessage(result.error);
      setState("error");
      return;
    }
    setState("idle");
  }

  return (
    <div className="flex items-center gap-2">
      {state === "error" && <span className="text-xs text-rose-600">{errorMessage}</span>}
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "checking"}
        className="secondary-button !rounded-lg !px-3 !py-1.5 !text-xs disabled:opacity-50"
      >
        {state === "checking" ? "Checking…" : "Check now"}
      </button>
    </div>
  );
}
