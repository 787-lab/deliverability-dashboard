import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8"><Brand href="/portal"/><Link href="/" className="text-sm font-semibold text-muted transition-colors hover:text-accent">Back to Advazon</Link></div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
