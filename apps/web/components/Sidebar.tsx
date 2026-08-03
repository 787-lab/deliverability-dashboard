"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  {
    href: "/admin",
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
    href: "/admin/alerts",
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
  {
    href: "/admin/clients",
    label: "Clients",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" strokeWidth={1.75}>
        <circle cx="7" cy="6.5" r="2.25" stroke="currentColor" />
        <path
          d="M2.75 15.5c0-2.5 1.9-4 4.25-4s4.25 1.5 4.25 4"
          stroke="currentColor"
          strokeLinecap="round"
        />
        <circle cx="13.5" cy="6.5" r="1.9" stroke="currentColor" />
        <path
          d="M12 11.7c1.9.2 3.25 1.6 3.25 3.8"
          stroke="currentColor"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/admin/domains",
    label: "Domains",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" strokeWidth={1.75}>
        <circle cx="10" cy="10" r="7" stroke="currentColor" />
        <path d="M3 10h14M10 3c1.8 1.9 2.8 4.3 2.8 7s-1 5.1-2.8 7c-1.8-1.9-2.8-4.3-2.8-7s1-5.1 2.8-7Z" stroke="currentColor" />
      </svg>
    ),
  },
];

const QUICK_LINKS = [
  { href: "/portal", label: "View Portal" },
  { href: "/", label: "View Public Site" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">
            A
          </div>
          <span className="text-sm font-semibold text-foreground">Advazon</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-background hover:text-foreground"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" strokeWidth={1.75}>
            <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width)] flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-2.5 border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
              A
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground">Advazon</div>
              <div className="text-[11px] font-medium tracking-wide text-subtle">DELIVERABILITY</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-background hover:text-foreground lg:hidden"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" strokeWidth={1.75}>
              <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4" onClick={() => setIsOpen(false)}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
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

          <div className="my-3 border-t border-border" />

          {QUICK_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-subtle" strokeWidth={1.75}>
                <path
                  d="M8 5H4.75A1.75 1.75 0 0 0 3 6.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0 0 15 15.25V12M11 3h6v6M16.5 3.5 9 11"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="border-t border-border px-5 py-4 text-[11px] text-subtle">
          Deliverability Dashboard v1
        </div>
      </aside>
    </>
  );
}
