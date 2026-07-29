const STYLES: Record<string, string> = {
  pass: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  fail: "bg-red-100 text-red-800",
  unknown: "bg-gray-100 text-gray-600",
  no_data: "bg-gray-50 text-gray-400",
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
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STYLES[status] ?? STYLES.unknown
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[severity] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {severity}
    </span>
  );
}
