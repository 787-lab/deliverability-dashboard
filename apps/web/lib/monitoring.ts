import type { MonitorStatus, MonitorType } from "./data";

export const MONITOR_DESCRIPTIONS: Record<MonitorType, string> = {
  spf: "Authorizes the systems allowed to send email for this domain.",
  dkim: "Confirms messages are signed and have not been altered in transit.",
  dmarc: "Defines alignment, reporting, and enforcement for failed authentication.",
  domain_reputation: "Checks whether the domain appears on monitored blocklists.",
  warmup: "Tracks sending-volume ramp and engagement risk signals.",
  inbox_placement: "Measures inbox, spam, and missing placement across mailbox providers.",
};

type CheckLike = {
  monitorType: MonitorType;
  status: MonitorStatus;
  details?: Record<string, unknown>;
};

export function calculateHealthScore(checks: { status: MonitorStatus }[]): number | null {
  const checked = checks.filter((check) => check.status !== "no_data" && check.status !== "unknown");
  if (checked.length === 0) return null;

  const points = checked.reduce((total, check) => {
    if (check.status === "pass") return total + 100;
    if (check.status === "warning") return total + 60;
    return total;
  }, 0);

  return Math.round(points / checked.length);
}

export function getMonitorRecommendation(check: CheckLike): { title: string; action: string } {
  const details = check.details ?? {};
  const errors = Array.isArray(details.errors) ? details.errors.map(String) : [];

  if (check.status === "pass") {
    return { title: "Healthy", action: "No change required. Continue monitoring for configuration drift." };
  }

  if (check.status === "no_data" || check.status === "unknown") {
    if (check.monitorType === "warmup") {
      return { title: "Data source required", action: "Connect the sending or warmup platform before using this signal for decisions." };
    }
    if (check.monitorType === "inbox_placement") {
      return { title: "Placement test required", action: "Run a provider-level seed test before scaling sending volume." };
    }
    return { title: "Waiting for a result", action: "Run a fresh domain check. If no result appears, review the worker connection." };
  }

  if (check.monitorType === "spf") {
    const lookupCount = typeof details.lookup_count === "number" ? details.lookup_count : null;
    return {
      title: lookupCount && lookupCount > 10 ? "SPF lookup limit exceeded" : "SPF needs correction",
      action: errors[0] ?? "Publish one valid SPF record and keep the total DNS lookup count at ten or fewer.",
    };
  }

  if (check.monitorType === "dkim") {
    return {
      title: "DKIM signature needs correction",
      action: errors[0] ?? "Confirm the active selector and publish a valid 2048-bit public key for the sending platform.",
    };
  }

  if (check.monitorType === "dmarc") {
    const policy = typeof details.policy === "string" ? details.policy : null;
    return {
      title: policy === "none" ? "DMARC is monitoring only" : "DMARC needs correction",
      action: errors[0] ?? "Confirm SPF/DKIM alignment and move enforcement gradually toward quarantine or reject.",
    };
  }

  if (check.monitorType === "domain_reputation") {
    const listedOn = Array.isArray(details.listed_on) ? details.listed_on.map(String) : [];
    return {
      title: listedOn.length ? "Blocklist listing detected" : "Reputation signal needs review",
      action: listedOn.length
        ? `Pause high-risk sending, identify the cause, and follow the delisting process for ${listedOn.join(", ")}.`
        : errors[0] ?? "Review recent volume, bounces, complaints, and provider reputation data.",
    };
  }

  return {
    title: check.status === "fail" ? "Immediate review required" : "Monitor this signal",
    action: errors[0] ?? "Review the latest result before increasing sending volume.",
  };
}
