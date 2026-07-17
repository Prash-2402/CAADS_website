import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Calendar, Plus, Users, ShieldAlert, ArrowLeft, Clock, MapPin } from "lucide-react";
import ScheduleMeetingForm from "./schedule-meeting-form";

export const metadata = {
  title: "Meetings & Grievances - CAADS",
};

export default async function AdminMeetingsPage() {
  const supabase = createClient();

  // Fetch scheduled meetings
  const { data: meetings } = await supabase
    .from("meetings")
    .select("id, title, date, agenda")
    .order("date", { ascending: false });

  // Fetch all grievances with student details
  const { data: grievances } = await supabase
    .from("grievances")
    .select(`
      id,
      message,
      status,
      created_at,
      profiles (
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-muted hover:text-ivory transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">Meetings &amp; Grievances</h1>
          <p className="font-body text-muted mt-1">Schedule club discussions and track internal issues.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Meetings List & Schedule Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Schedule Form */}
          <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-ivory mb-6 flex items-center gap-2">
              <Plus className="text-gold" size={20} />
              Schedule Meeting
            </h2>
            <ScheduleMeetingForm />
          </div>

          {/* Meetings List */}
          <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-ivory mb-6 flex items-center gap-2">
              <Calendar className="text-gold" size={20} />
              Scheduled Meetings
            </h2>
            <div className="divide-y divide-border-gold/20">
              {meetings?.map((meeting) => (
                <div key={meeting.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-semibold text-ivory">{meeting.title}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-1 font-body">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {format(parseISO(meeting.date), "PPP")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {format(parseISO(meeting.date), "p")}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/meetings/${meeting.id}`}
                    className="px-3 py-1.5 text-xs bg-bg border border-border-gold/50 rounded-lg hover:border-gold text-ivory transition-colors font-semibold"
                  >
                    View Minutes
                  </Link>
                </div>
              ))}
              {(!meetings || meetings.length === 0) && (
                <p className="text-muted text-sm py-4">No scheduled meetings found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Grievances Feed */}
        <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 space-y-6">
          <h2 className="font-display text-xl font-bold text-ivory flex items-center gap-2">
            <ShieldAlert className="text-gold" size={22} />
            Member Grievances
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {grievances?.map((g) => (
              <div key={g.id} className="p-4 rounded-xl bg-bg border border-border-gold/20 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-display text-xs font-bold text-gold">
                      {(g.profiles as any)?.full_name || "Anonymous"}
                    </span>
                    <p className="text-[10px] text-muted font-body mt-0.5">
                      {format(parseISO(g.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${g.status === "resolved" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {g.status}
                  </span>
                </div>
                <p className="font-body text-xs text-muted break-words">{g.message}</p>
                
                {g.status === "open" && (
                  <form action={async () => {
                    "use server";
                    const { updateGrievanceStatus } = await import("./actions");
                    await updateGrievanceStatus(g.id, "resolved");
                  }}>
                    <button
                      type="submit"
                      className="w-full py-1.5 rounded-lg bg-gold/10 border border-gold/30 hover:bg-gold hover:text-bg text-gold transition-all text-[11px] font-semibold"
                    >
                      Mark Resolved
                    </button>
                  </form>
                )}
              </div>
            ))}
            {(!grievances || grievances.length === 0) && (
              <p className="text-muted text-sm py-4 text-center">No grievances logged.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
