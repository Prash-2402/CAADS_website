import { Header } from "./header";
import { Footer } from "./footer";
import { getRole } from "@/lib/supabase/auth";

export async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getRole();

  return (
    <div className="flex min-h-screen flex-col">
      <Header userRole={role} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
