import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen pl-[var(--sidebar-width)]">
        <div className="mx-auto w-full max-w-6xl px-8 py-10">{children}</div>
      </main>
    </>
  );
}
