export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center gap-2.5 border-b border-border px-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
          A
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-foreground">Advazon</div>
          <div className="text-[11px] font-medium tracking-wide text-subtle">DELIVERABILITY</div>
        </div>
      </header>
      <main className="flex-1 px-6">{children}</main>
    </div>
  );
}
