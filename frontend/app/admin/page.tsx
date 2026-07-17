import { createClient } from "@/lib/supabase/server";
import { Calendar, Users, FileText, ClipboardList } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

export const metadata = {
  title: "Leader Dashboard - CAADS",
};

export default async function AdminPage() {
  const supabase = createClient();

  // Fetch stats concurrently
  const [
    { count: eventsCount },
    { count: regsCount },
    { count: pendingYfCount },
    { count: volunteersCount },
    { data: recentEvents }
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("event_registrations").select("*", { count: "exact", head: true }),
    supabase.from("yellow_forms").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["volunteer", "core_team", "admin"]),
    supabase.from("events").select("id, title, date, venue, is_public").order("date", { ascending: false }).limit(5)
  ]);

  const stats = [
    {
      name: "Total Events",
      value: eventsCount || 0,
      icon: Calendar,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "Event Registrations",
      value: regsCount || 0,
      icon: ClipboardList,
      color: "text-green-400 bg-green-500/10 border-green-500/20",
    },
    {
      name: "Pending Yellow Forms",
      value: pendingYfCount || 0,
      icon: FileText,
      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    },
    {
      name: "Active Staff & Volunteers",
      value: volunteersCount || 0,
      icon: Users,
      color: "text-gold bg-gold/10 border-border-gold/30",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-ivory">Leader Dashboard</h1>
        <p className="font-body text-muted mt-1">Platform overview and metrics.</p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`p-6 rounded-2xl border bg-bg-secondary flex items-center justify-between shadow-sm hover:border-gold/50 transition-colors duration-200 ${stat.color.split(" ").slice(2).join(" ")}`}
          >
            <div>
              <p className="font-body text-sm text-muted">{stat.name}</p>
              <h3 className="font-display text-2xl font-bold text-ivory mt-2">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl border ${stat.color.split(" ").slice(0, 2).join(" ")}`}>
              <stat.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events List */}
        <div className="lg:col-span-2 bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-xl font-bold text-ivory mb-6">Recent Events</h2>
          <div className="divide-y divide-border-gold/30">
            {recentEvents?.map((event) => (
              <div key={event.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-semibold text-ivory">{event.title}</h4>
                  <p className="font-body text-xs text-muted mt-1">
                    {format(parseISO(event.date), "PPP")} &bull; {event.venue || "No Venue"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${event.is_public ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}>
                    {event.is_public ? "Public" : "Draft"}
                  </span>
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="px-3 py-1 text-xs bg-bg border border-border-gold/50 rounded-lg hover:border-gold text-ivory transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
            {(!recentEvents || recentEvents.length === 0) && (
              <p className="text-muted text-sm py-4">No events found.</p>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold text-ivory mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/events/create"
              className="block w-full py-3 px-4 rounded-xl bg-gold hover:bg-gold-bright text-bg font-semibold text-center transition-colors text-sm"
            >
              Create New Event
            </Link>
            <Link
              href="/admin/scan"
              className="block w-full py-3 px-4 rounded-xl bg-bg border border-border-gold/50 hover:border-gold text-ivory font-semibold text-center transition-colors text-sm"
            >
              Launch QR Scan Mode
            </Link>
            <Link
              href="/admin/yellow-forms"
              className="block w-full py-3 px-4 rounded-xl bg-bg border border-border-gold/50 hover:border-gold text-ivory font-semibold text-center transition-colors text-sm"
            >
              Review Yellow Forms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
