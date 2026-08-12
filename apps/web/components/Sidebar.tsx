"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Brand } from "./Brand";
import { BellIcon, CloseIcon, ExternalIcon, GlobeIcon, MenuIcon, PulseIcon, UsersIcon } from "./Icons";

const navItems = [
  { href: "/admin", label: "Overview", icon: PulseIcon },
  { href: "/admin/alerts", label: "Alerts", icon: BellIcon },
  { href: "/admin/clients", label: "Clients", icon: UsersIcon },
  { href: "/admin/domains", label: "Domains", icon: GlobeIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur-lg lg:hidden">
        <Brand href="/admin" />
        <button type="button" onClick={() => setIsOpen(true)} aria-label="Open navigation" className="secondary-button !p-2.5"><MenuIcon className="h-5 w-5"/></button>
      </header>
      {isOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width)] flex-col border-r border-slate-800 bg-navy text-white transition-transform duration-200 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5 [&_.brand-mark]:shadow-none [&_span]:text-white">
          <Brand href="/admin" />
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Close navigation" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"><CloseIcon className="h-5 w-5"/></button>
        </div>
        <div className="px-4 pt-5"><p className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Workspace</p></div>
        <nav className="flex-1 space-y-1 px-3 py-3" onClick={() => setIsOpen(false)}>
          {navItems.map(({href,label,icon:NavIcon}) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? "bg-accent text-white shadow-lg shadow-blue-950/20" : "text-slate-400 hover:bg-white/[.07] hover:text-white"}`}><NavIcon className="h-[18px] w-[18px]"/>{label}</Link>;
          })}
          <div className="my-4 border-t border-white/10"/>
          <a href="/portal" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[.07] hover:text-white"><span>Client portal</span><ExternalIcon className="h-4 w-4"/></a>
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[.07] hover:text-white"><span>Public site</span><ExternalIcon className="h-4 w-4"/></a>
        </nav>
        <div className="m-3 rounded-xl border border-white/10 bg-white/[.05] p-3.5">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-400/15 text-xs font-bold text-blue-300">RH</span><div className="min-w-0"><p className="truncate text-xs font-semibold text-white">Advazon Admin</p><p className="mt-0.5 truncate text-[10px] text-slate-500">Operations workspace</p></div></div>
        </div>
      </aside>
    </>
  );
}
