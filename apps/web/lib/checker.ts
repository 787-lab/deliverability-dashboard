// Calls the apps/api "Check Now" endpoint to run SPF/DKIM/DMARC/reputation
// checks for one domain immediately, instead of waiting for the nightly cron.
// Server-only: CHECKER_API_SECRET must never reach the client.
export type CheckDomainResult = { ok: true } | { ok: false; error: string };

export async function triggerDomainCheck(domainId: string): Promise<CheckDomainResult> {
  const apiUrl = process.env.CHECKER_API_URL;
  const secret = process.env.CHECKER_API_SECRET;

  if (!apiUrl || !secret) {
    return { ok: false, error: "Checker service is not configured." };
  }

  try {
    const res = await fetch(`${apiUrl}/domains/${domainId}/check`, {
      method: "POST",
      headers: { "X-Check-Secret": secret },
    });

    if (!res.ok) {
      return { ok: false, error: `Check failed (${res.status}).` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach the checker service." };
  }
}
