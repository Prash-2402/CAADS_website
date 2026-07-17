import { getProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Calendar, Clock, MapPin, UserSquare2, Timer } from "lucide-react";
import type { Metadata } from "next";
import { AssignmentActions } from "./_components/assignment-actions";

export const metadata: Metadata = {
  title: "Assignment Details",
};

export default async function AssignmentDetailsPage({ params }: { params: { id: string } }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  if (!["volunteer", "core_team", "admin"].includes(profile.role)) {
    redirect("/dashboard");
  }

  const supabase = createClient();

  const { data: assignment } = await supabase
    .from("volunteer_assignments")
    .select(`
      id,
      role,
      status,
      expected_duration,
      invited_by,
      events (
        id,
        title,
        date,
        time,
        venue
      )
    `)
    .eq("event_id", params.id)
    .eq("user_id", profile.id)
    .single();

  if (!assignment) {
    notFound();
  }

  // @ts-ignore
  const event = assignment.events as any;
  if (!event) notFound();

  // Fetch coordinator details if invited_by is present
  let coordinator = null;
  if (assignment.invited_by) {
    const { data: coordData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", assignment.invited_by)
      .single();
    if (coordData) coordinator = coordData;
  }

  const eventDate = parseISO(event.date);

  return (
    <div className="max-w-3xl space-y-6">
      <Link 
        href="/volunteer"
        className="inline-flex items-center gap-2 text-muted hover:text-ivory transition-colors font-body text-sm"
      >
        <ArrowLeft size={16} />
        Back to Assignments
      </Link>
      
      <div>
        <h1 className="font-display text-3xl font-bold text-ivory">Assignment Details</h1>
        <p className="font-body text-muted mt-1">Volunteer duty for {event.title}</p>
      </div>

      <div className="bg-bg-secondary border border-border-gold rounded-2xl overflow-hidden shadow-gold">
        <div className="p-6 md:p-8 border-b border-border-gold/30">
          <h2 className="font-display text-xl font-bold text-ivory mb-4">{event.title}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-gold" size={18} />
              <div>
                <p className="text-xs text-muted font-semibold uppercase">Date</p>
                <p className="font-body text-ivory text-sm">{format(eventDate, "MMM d, yyyy")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="text-gold" size={18} />
              <div>
                <p className="text-xs text-muted font-semibold uppercase">Time</p>
                <p className="font-body text-ivory text-sm">{event.time ? event.time.substring(0, 5) : "TBD"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="text-gold" size={18} />
              <div>
                <p className="text-xs text-muted font-semibold uppercase">Venue</p>
                <p className="font-body text-ivory text-sm">{event.venue || "TBD"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8 bg-bg-secondary/50">
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-bg p-5 rounded-xl border border-border-gold/30">
              <div className="flex items-center gap-3 mb-2">
                <UserSquare2 className="text-gold" size={20} />
                <h3 className="font-display font-bold text-ivory">Your Role</h3>
              </div>
              <p className="font-body text-muted text-sm">{assignment.role || "General Volunteer"}</p>
            </div>
            
            <div className="bg-bg p-5 rounded-xl border border-border-gold/30">
              <div className="flex items-center gap-3 mb-2">
                <Timer className="text-gold" size={20} />
                <h3 className="font-display font-bold text-ivory">Expected Duration</h3>
              </div>
              <p className="font-body text-muted text-sm">{assignment.expected_duration || "Full event duration"}</p>
            </div>
          </section>

          {coordinator && (
            <section className="bg-bg p-5 rounded-xl border border-border-gold/30">
               <h3 className="font-display font-bold text-ivory mb-1">Coordinator</h3>
               <p className="font-body text-muted text-sm">Assigned by {coordinator.full_name}</p>
            </section>
          )}

          <section>
            <h3 className="font-display font-bold text-lg text-ivory mb-4 border-b border-border-gold/30 pb-2">Your Response</h3>
            <AssignmentActions 
              eventId={event.id} 
              currentStatus={assignment.status} 
            />
          </section>
        </div>
      </div>
    </div>
  );
}
