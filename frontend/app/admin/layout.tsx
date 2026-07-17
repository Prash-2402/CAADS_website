import { getProfile } from "@/lib/supabase/auth";
import { LeaderGate } from "@/components/role-gate";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  QrCode,
  FileText,
  Users,
  Bot,
  FolderOpen,
  Settings,
  Shield,
  Star,
  Mail,
  LogOut
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) return null; // RoleGate inside LeaderGate will handle redirect

  const isAdmin = profile.role === "admin";

  return (
    <LeaderGate>
      <div className="min-h-screen bg-bg flex flex-col md:flex-row pt-16">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-bg-secondary border-r border-border-gold flex-shrink-0 md:h-[calc(100vh-4rem)] md:sticky md:top-16 overflow-y-auto">
          <div className="p-6">
            {/* User Profile Summary */}
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

            {/* Navigation links */}
            <nav className="space-y-1">
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 mt-6">
                Leader Space
              </div>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
              >
                <LayoutDashboard size={18} />
                Overview
              </Link>
              <Link
                href="/admin/events"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
              >
                <CalendarDays size={18} />
                Manage Events
              </Link>
              <Link
                href="/admin/scan"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
              >
                <QrCode size={18} />
                Scan Mode
              </Link>
              <Link
                href="/admin/yellow-forms"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
              >
                <FileText size={18} />
                Yellow Forms
              </Link>
              <Link
                href="/admin/meetings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
              >
                <Users size={18} />
                Meetings
              </Link>
              <Link
                href="/admin/documents"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
              >
                <FolderOpen size={18} />
                Documents (Drive)
              </Link>
              <Link
                href="/admin/assistant"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
              >
                <Bot size={18} />
                AI Assistant
              </Link>

              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 mt-8">
                Feedback & Contact
              </div>
              <Link
                href="/admin/reviews"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
              >
                <Star size={18} />
                Reviews
              </Link>
              <Link
                href="/admin/messages"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
              >
                <Mail size={18} />
                Contact Messages
              </Link>

              {isAdmin && (
                <>
                  <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 mt-8">
                    Administration
                  </div>
                  <Link
                    href="/admin/members"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
                  >
                    <Shield size={18} />
                    Members & Roles
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-ivory hover:bg-gold/10 hover:text-gold transition-colors font-body text-sm"
                  >
                    <Settings size={18} />
                    Site Settings
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
    </LeaderGate>
  );
}
