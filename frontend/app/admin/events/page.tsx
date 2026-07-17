import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Calendar, Plus, Clock, MapPin, Eye, EyeOff } from "lucide-react";

export const metadata = {
  title: "Manage Events - CAADS",
};

export default async function AdminEventsPage() {
  const supabase = createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, date, time, venue, is_public, speaker")
    .order("date", { ascending: false });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">Manage Events</h1>
          <p className="font-body text-muted mt-1">Create, edit, and monitor club events.</p>
        </div>
        <Link
          href="/admin/events/create"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gold text-bg font-semibold hover:bg-gold-bright transition-colors text-sm self-start sm:self-center"
        >
          <Plus size={18} />
          Create Event
        </Link>
      </div>

      <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-gold/30 text-muted font-display text-xs uppercase tracking-wider">
                <th className="pb-4 font-semibold">Title</th>
                <th className="pb-4 font-semibold">Date &amp; Time</th>
                <th className="pb-4 font-semibold">Venue</th>
                <th className="pb-4 font-semibold">Speaker</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gold/20 font-body text-sm text-ivory">
              {events?.map((event) => {
                const eventDate = parseISO(event.date);
                return (
                  <tr key={event.id} className="hover:bg-bg/40 transition-colors">
                    <td className="py-4 font-semibold max-w-[200px] truncate">{event.title}</td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} className="text-gold" />
                          {format(eventDate, "MMM d, yyyy")}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1 text-xs text-muted mt-1">
                            <Clock size={12} />
                            {event.time.substring(0, 5)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-muted">
                      {event.venue ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {event.venue}
                        </span>
                      ) : (
                        "TBD"
                      )}
                    </td>
                    <td className="py-4 text-muted">{event.speaker || "None"}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${event.is_public ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}>
                        {event.is_public ? (
                          <>
                            <Eye size={12} /> Public
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} /> Draft
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="px-3 py-1.5 text-xs bg-bg border border-border-gold/50 rounded-lg hover:border-gold text-ivory transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/events/${event.id}/attendance`}
                          className="px-3 py-1.5 text-xs bg-gold/10 border border-gold/30 rounded-lg hover:bg-gold hover:text-bg text-gold transition-colors font-semibold"
                        >
                          Attendance
                        </Link>
                        <Link
                          href={`/admin/events/${event.id}/volunteers`}
                          className="px-3 py-1.5 text-xs bg-bg-secondary border border-border-gold/30 rounded-lg hover:border-gold text-muted hover:text-ivory transition-colors"
                        >
                          Volunteers
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!events || events.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    No events scheduled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
