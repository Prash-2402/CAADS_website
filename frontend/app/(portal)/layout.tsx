import { getProfile } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CalendarDays, ClipboardCheck, QrCode, LogOut, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  const isVolunteer = ["volunteer", "core_team", "admin"].includes(profile.role);
  
  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row pt-16">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-bg-secondary border-r border-border-gold flex-shrink-0 md:h-[calc(100vh-4rem)] md:sticky md:top-16 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-display font-bold text-xl border border-gold/50">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-semibold text-ivory text-sm truncate max-w-[150px]">
                {profile.full_name}
              </h2>
              <p className="font-body text-xs text-muted capitalize">
                {profile.role.replace("_", " ")}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 mt-6">
              Student Space
            </div>
            <Link 
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
            >
              <LayoutDashboard size={18} />
              My Overview
            </Link>
            <Link 
              href="/dashboard/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
            >
              <QrCode size={18} />
              My ID & Profile
            </Link>

            {isVolunteer && (
              <>
                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 mt-8">
                  Volunteer Portal
                </div>
                <Link 
                  href="/volunteer"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
                >
                  <ClipboardCheck size={18} />
                  My Assignments
                </Link>
                <Link 
                  href="/volunteer/yellow-forms"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
                >
                  <FileText size={18} />
                  Yellow Forms
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="p-6 mt-auto">
          <form action="/auth/signout" method="post">
            <button 
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors font-body text-sm"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
