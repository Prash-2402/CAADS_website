import { getProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Calendar, CheckCircle2, Clock, MapPin, XCircle, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Volunteer Portal",
};

export default async function VolunteerPortalPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  // Gate check
  if (!["volunteer", "core_team", "admin"].includes(profile.role)) {
    redirect("/dashboard"); // fallback for students
  }

  const supabase = createClient();

  const { data: assignments } = await supabase
    .from("volunteer_assignments")
    .select(`
      id,
      role,
      status,
      event_id,
      expected_duration,
      events (
        id,
        title,
        date,
        time,
        venue
      )
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-ivory">Volunteer Portal</h1>
        <p className="font-body text-muted mt-1">Manage your event assignments and duties.</p>
      </div>

      <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8 shadow-gold">
        <h2 className="font-display text-xl font-bold text-ivory mb-6 flex items-center gap-2">
          <Clock className="text-gold" size={24} />
          My Assignments
        </h2>

        <div className="space-y-4">
          {assignments?.map((assignment) => {
            // @ts-ignore
            const event = assignment.events as any;
            if (!event) return null;
            
            const eventDate = parseISO(event.date);
            const isPastEvent = eventDate < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div key={assignment.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-border-gold/30 bg-bg hover:border-gold/50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display font-semibold text-ivory text-lg truncate max-w-sm">
                      {event.title}
                    </h3>
                    {assignment.status === 'accepted' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] uppercase font-bold tracking-wider">
                        Accepted
                      </span>
                    ) : assignment.status === 'invited' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] uppercase font-bold tracking-wider animate-pulse">
                        New Invite
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] uppercase font-bold tracking-wider">
                        Declined
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted mt-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gold/70" />
                      {format(eventDate, "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gold/70" />
                      {event.venue || "TBD"}
                    </span>
                    {assignment.role && (
                      <span className="flex items-center gap-1.5 font-medium text-ivory/80">
                        Role: {assignment.role}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Link 
                    href={`/volunteer/events/${event.id}`}
                    className="inline-flex items-center justify-center p-2 rounded-lg bg-gold/10 text-gold hover:bg-gold hover:text-bg transition-colors"
                    aria-label="View Details"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </div>
            );
          })}

          {(!assignments || assignments.length === 0) && (
            <div className="py-12 text-center border border-dashed border-border-gold rounded-xl">
              <p className="text-muted font-body mb-4">You have no volunteer assignments yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
