import { getMyDomains } from "@/lib/portal-data";
import { VerifyPanel } from "./VerifyPanel";
import { CheckNowButton } from "./CheckNowButton";

export async function DomainList() {
  const domains = await getMyDomains();

  if (domains.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-strong bg-surface px-6 py-8 text-center text-sm text-subtle">
        No domains connected yet — add one below.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {domains.map((domain) =>
        domain.isVerified ? (
          <div
            key={domain.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <span className="text-sm font-medium text-foreground">{domain.domainName}</span>
            <div className="flex items-center gap-2">
              <CheckNowButton domainId={domain.id} />
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                Verified
              </span>
            </div>
          </div>
        ) : (
          <VerifyPanel
            key={domain.id}
            domainId={domain.id}
            domainName={domain.domainName}
            verificationToken={domain.verificationToken}
          />
        )
      )}
    </div>
  );
}
