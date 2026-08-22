export default function AdminLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white"><div className="mx-auto flex h-[76px] max-w-7xl items-center px-5 sm:px-8"><Brand href="/"/></div></header>
      <main className="px-5 sm:px-8">{children}</main>
    </div>
  );
}
import { Brand } from "@/components/Brand";
