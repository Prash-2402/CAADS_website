import { getProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Calendar, CheckCircle2, Clock, MapPin, XCircle, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registration Details",
};

export default async function RegistrationDetailsPage({ params }: { params: { id: string } }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = createClient();

  // Fetch registration details
  const { data: registration } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", params.id)
    .eq("user_id", profile.id)
    .single();

  if (!registration) {
    notFound();
  }

  // Fetch event details
  const { data: event } = await supabase
    .from("events_public")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) notFound();

  // Fetch attendance record
  const { data: attendance } = await supabase
    .from("attendance")
    .select("status, method, created_at")
    .eq("event_id", params.id)
    .eq("user_id", profile.id)
    .maybeSingle();

  // Fetch yellow form
  const { data: yellowForm } = await supabase
    .from("yellow_forms")
    .select("status, periods")
    .eq("event_id", params.id)
    .eq("user_id", profile.id)
    .maybeSingle();

  const eventDate = parseISO(event.date);
  const isPastEvent = eventDate < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className="max-w-3xl space-y-6">
      <Link 
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted hover:text-ivory transition-colors font-body text-sm"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
      
      <div>
        <h1 className="font-display text-3xl font-bold text-ivory">Registration Details</h1>
        <p className="font-body text-muted mt-1">Status for {event.title}</p>
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
            
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-gold" size={18} />
              <div>
                <p className="text-xs text-muted font-semibold uppercase">Registered On</p>
                <p className="font-body text-ivory text-sm">{format(new Date(registration.registered_at), "MMM d, yyyy h:mm a")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8 bg-bg-secondary/50">
          {/* Attendance Section */}
          <section>
            <h3 className="font-display font-bold text-lg text-ivory mb-4 border-b border-border-gold/30 pb-2">Attendance Status</h3>
            
            {!attendance ? (
              <div className="flex items-center gap-3">
                <Clock className="text-muted" size={24} />
                <div>
                  <p className="font-body text-ivory">Not yet recorded</p>
                  <p className="text-sm text-muted">Attendance will be marked during the event.</p>
                </div>
              </div>
            ) : attendance.status === 'approved' ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-400" size={24} />
                <div>
                  <p className="font-body text-ivory">Present</p>
                  <p className="text-sm text-muted">Method: {attendance.method === 'qr_self' ? 'QR Scan' : 'Manual/Staff Scan'}</p>
                </div>
              </div>
            ) : attendance.status === 'pending' ? (
              <div className="flex items-center gap-3">
                <Clock className="text-yellow-400" size={24} />
                <div>
                  <p className="font-body text-ivory">Pending Approval</p>
                  <p className="text-sm text-muted">Your attendance claim is waiting for admin approval.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <XCircle className="text-red-400" size={24} />
                <div>
                  <p className="font-body text-ivory">Rejected / Absent</p>
                  <p className="text-sm text-muted">Your attendance claim was rejected.</p>
                </div>
              </div>
            )}
          </section>

          {/* Yellow Form Section */}
          <section>
            <h3 className="font-display font-bold text-lg text-ivory mb-4 border-b border-border-gold/30 pb-2">Yellow Form</h3>
            
            {!yellowForm ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-muted" size={24} />
                  <div>
                    <p className="font-body text-ivory">No request</p>
                    <p className="text-sm text-muted">You haven&apos;t requested a yellow form for this event.</p>
                  </div>
                </div>
                <Link 
                  href={`/volunteer/yellow-forms?event=${event.id}`}
                  className="inline-flex justify-center items-center px-4 py-2 rounded-xl bg-gold/10 text-gold border border-gold hover:bg-gold hover:text-bg transition-colors text-sm font-semibold whitespace-nowrap"
                >
                  Request Yellow Form
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {yellowForm.status === 'approved' ? (
                  <CheckCircle2 className="text-green-400" size={24} />
                ) : yellowForm.status === 'rejected' ? (
                  <XCircle className="text-red-400" size={24} />
                ) : (
                  <Clock className="text-yellow-400" size={24} />
                )}
                <div>
                  <p className="font-body text-ivory capitalize">Status: {yellowForm.status}</p>
                  <p className="text-sm text-muted">Periods: {yellowForm.periods.join(', ')}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
