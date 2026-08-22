import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getServerSupabaseForUser } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await getServerSupabaseForUser();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen lg:pl-[var(--sidebar-width)]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 sm:py-10 xl:px-10">{children}</div>
      </main>
    </>
  );
}
