"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Status",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" strokeWidth={1.75}>
        <path
          d="M2.5 10.5h3.2l1.8-4.5 2.6 8 1.8-5.5 1.4 2h4.2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/alerts",
    label: "Alerts",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" strokeWidth={1.75}>
        <path
          d="M10 3.5c-2.2 0-4 1.8-4 4v2.3l-1.2 2.4c-.2.4.1.9.6.9h9.2c.5 0 .8-.5.6-.9L14 9.8V7.5c0-2.2-1.8-4-4-4Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8.3 15.5a1.7 1.7 0 0 0 3.4 0" stroke="currentColor" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[var(--sidebar-width)] flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
          A
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-foreground">Advazon</div>
          <div className="text-[11px] font-medium tracking-wide text-subtle">DELIVERABILITY</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <span className={isActive ? "text-accent" : "text-subtle"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-5 py-4 text-[11px] text-subtle">
        Deliverability Dashboard v1
      </div>
    </aside>
  );
}
