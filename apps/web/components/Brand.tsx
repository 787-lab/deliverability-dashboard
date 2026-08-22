import Link from "next/link";

export function Brand({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-3" aria-label="advazon. Deliverability home">
      <span className="brand-mark" aria-hidden="true">a.</span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[15px] font-bold tracking-[-0.02em] text-foreground">advazon.</span>
          <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.22em] text-subtle">Deliverability</span>
        </span>
      )}
    </Link>
  );
}
