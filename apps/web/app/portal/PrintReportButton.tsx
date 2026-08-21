"use client";

export function PrintReportButton() {
  return (
    <button type="button" className="secondary-button print:hidden" onClick={() => window.print()}>
      Print / save PDF
    </button>
  );
}
