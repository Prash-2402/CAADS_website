import { getProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Calendar, CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createClient();

  // Fetch registrations with event details and attendance status
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(`
      id,
      registered_at,
      events (
        id,
        title,
        date,
        time,
        venue
      )
    `)
    .eq("user_id", profile.id)
    .order("registered_at", { ascending: false });

  // Fetch attendance records for this user to match against registrations
  const { data: attendance } = await supabase
    .from("attendance")
    .select("event_id, status")
    .eq("user_id", profile.id);

  // Fetch yellow forms
  const { data: yellowForms } = await supabase
    .from("yellow_forms")
    .select("event_id, status, periods")
    .eq("user_id", profile.id);

  const attendanceMap = new Map(attendance?.map(a => [a.event_id, a.status]));
  const yellowFormMap = new Map(yellowForms?.map(yf => [yf.event_id, yf]));

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-ivory">Welcome, {profile.full_name.split(" ")[0]}!</h1>
        <p className="font-body text-muted mt-1">Here is your student overview.</p>
      </div>

      <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8 shadow-gold">
        <h2 className="font-display text-xl font-bold text-ivory mb-6 flex items-center gap-2">
          <Calendar className="text-gold" size={24} />
          My Registrations
        </h2>

        <div className="space-y-4">
          {registrations?.map((reg) => {
            // @ts-ignore
            const event = reg.events as any;
            if (!event) return null;
            
            const eventDate = parseISO(event.date);
            const attendanceStatus = attendanceMap.get(event.id);
            const yellowForm = yellowFormMap.get(event.id);
            const isPastEvent = eventDate < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div key={reg.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border-gold/30 bg-bg hover:border-gold/50 transition-colors">
                <div>
                  <h3 className="font-display font-semibold text-ivory text-lg">
                    <Link href={`/events/${event.id}`} className="hover:text-gold transition-colors">
                      {event.title}
                    </Link>
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {format(eventDate, "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {event.time ? event.time.substring(0, 5) : "TBD"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Attendance Badge */}
                  {attendanceStatus === 'approved' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold">
                      <CheckCircle2 size={14} /> Present
                    </span>
                  ) : attendanceStatus === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-semibold">
                      <Clock size={14} /> Pending Approval
                    </span>
                  ) : isPastEvent ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
                      <XCircle size={14} /> Absent
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                      Registered
                    </span>
                  )}

                  {/* Yellow Form Status/Action */}
                  {yellowForm ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      yellowForm.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      yellowForm.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      <FileText size={14} />
                      YF {yellowForm.status}
                    </span>
                  ) : (
                    <Link 
                      href={`/volunteer/yellow-forms?event=${event.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-bg transition-colors text-xs font-semibold"
                    >
                      <FileText size={14} />
                      Request YF
                    </Link>
                  )}
                  
                  <Link 
                    href={`/dashboard/events/${event.id}`}
                    className="px-4 py-1.5 rounded-lg bg-bg-secondary border border-border-gold text-ivory text-sm hover:border-gold transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            );
          })}

          {(!registrations || registrations.length === 0) && (
            <div className="py-12 text-center border border-dashed border-border-gold rounded-xl">
              <p className="text-muted font-body mb-4">You haven&apos;t registered for any events yet.</p>
              <Link 
                href="/events"
                className="inline-flex px-6 py-2 rounded-xl bg-gold text-bg font-semibold hover:bg-gold-bright transition-colors"
              >
                Browse Events
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
