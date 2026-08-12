const STYLES: Record<string, string> = {
  pass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  warning: "bg-amber-50 text-amber-700 border-amber-200/80",
  fail: "bg-rose-50 text-rose-700 border-rose-200/80",
  unknown: "bg-slate-50 text-slate-600 border-slate-200",
  no_data: "bg-slate-50 text-subtle border-slate-200 border-dashed",
};

const DOT_STYLES: Record<string, string> = {
  pass: "bg-emerald-500",
  warning: "bg-amber-500",
  fail: "bg-rose-500",
  unknown: "bg-slate-400",
  no_data: "bg-slate-300",
};

const LABELS: Record<string, string> = {
  pass: "Pass",
  warning: "Warning",
  fail: "Fail",
  unknown: "Unknown",
  no_data: "No data",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        STYLES[status] ?? STYLES.unknown
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status] ?? DOT_STYLES.unknown}`} />
      {LABELS[status] ?? status}
    </span>
  );
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-rose-50 text-rose-700 border-rose-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
        SEVERITY_STYLES[severity] ?? "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {severity}
    </span>
  );
}
