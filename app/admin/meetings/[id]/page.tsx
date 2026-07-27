import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, BookOpen, Users, FileText, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import MinutesEditor from "./minutes-editor";
import { logMeetingAttendance } from "../actions";

export const metadata = {
  title: "Meeting Details - CAADS",
};

export default async function MeetingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Fetch meeting details
  const { data: meeting } = await supabase
    .from("meetings")
    .select("id, title, date, agenda")
    .eq("id", params.id)
    .single();

  if (!meeting) {
    notFound();
  }

  // Fetch minutes
  const { data: minutes } = await supabase
    .from("meeting_minutes")
    .select("raw_notes, ai_refined_notes, sent_at")
    .eq("meeting_id", params.id)
    .maybeSingle();

  // Fetch staff members
  const { data: staffMembers } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["volunteer", "core_team", "admin"]);

  // Fetch meeting attendance
  const { data: attendance } = await supabase
    .from("meeting_attendance")
    .select("user_id, status")
    .eq("meeting_id", params.id);

  const attendanceMap = new Map(attendance?.map((a) => [a.user_id, a.status]));

  // Fetch linked grievances
  const { data: grievances } = await supabase
    .from("grievances")
    .select(`
      id,
      message,
      status,
      profiles (
        full_name
      )
    `)
    .eq("meeting_id", params.id);

  // Form action to mark attendance
  const handleMarkAttendance = async (formData: FormData) => {
    "use server";
    const userId = formData.get("userId") as string;
    const status = formData.get("status") as "approved" | "rejected";
    await logMeetingAttendance(params.id, userId, status);
  };

  const parsedDate = parseISO(meeting.date);

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/meetings" className="text-muted hover:text-ivory transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">{meeting.title}</h1>
          <p className="font-body text-muted mt-1">Configure meeting minutes and record attendance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Agenda, Minutes and Grievances */}
        <div className="lg:col-span-2 space-y-8">
          {/* Agenda Card */}
          <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-ivory mb-4 flex items-center gap-2">
              <BookOpen className="text-gold" size={20} />
              Agenda
            </h2>
            <p className="font-body text-sm text-muted whitespace-pre-wrap">
              {meeting.agenda || "No agenda provided."}
            </p>
            <div className="flex gap-6 mt-6 pt-6 border-t border-border-gold/20 text-xs font-mono text-muted">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gold" />
                {format(parsedDate, "PPP")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-gold" />
                {format(parsedDate, "p")}
              </span>
            </div>
          </div>

          {/* Minutes Editor */}
          <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-ivory mb-6 flex items-center gap-2">
              <FileText className="text-gold" size={20} />
              Meeting Minutes (AI Integrated)
            </h2>
            <MinutesEditor
              meetingId={meeting.id}
              initialRawNotes={minutes?.raw_notes || ""}
              initialAiNotes={minutes?.ai_refined_notes || ""}
              sentAt={minutes?.sent_at}
            />
          </div>

          {/* Linked Grievances */}
          <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-ivory mb-6">Linked Grievances</h2>
            <div className="space-y-4">
              {grievances?.map((g) => (
                <div key={g.id} className="p-4 rounded-xl bg-bg border border-border-gold/20 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <p className="font-display text-xs font-bold text-gold">
                      {(g.profiles as any)?.full_name || "Anonymous"}
                    </p>
                    <p className="font-body text-xs text-muted">{g.message}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${g.status === "resolved" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {g.status}
                  </span>
                </div>
              ))}
              {(!grievances || grievances.length === 0) && (
                <p className="text-muted text-sm font-body">No grievances linked to this meeting.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Staff Attendance Checklist */}
        <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 h-fit space-y-6">
          <h2 className="font-display text-xl font-bold text-ivory flex items-center gap-2">
            <Users className="text-gold" size={22} />
            Staff Attendance
          </h2>
          <div className="divide-y divide-border-gold/20 max-h-[600px] overflow-y-auto pr-1">
            {staffMembers?.map((member) => {
              const status = attendanceMap.get(member.id);
              return (
                <div key={member.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-display text-sm font-semibold text-ivory">{member.full_name}</h4>
                    <p className="font-body text-[10px] text-muted capitalize">{member.role.replace("_", " ")}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={handleMarkAttendance}>
                      <input type="hidden" name="userId" value={member.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button
                        type="submit"
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          status === "approved"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-bg border-border-gold/30 text-muted hover:border-green-500/50 hover:text-green-400"
                        }`}
                      >
                        Present
                      </button>
                    </form>
                    <form action={handleMarkAttendance}>
                      <input type="hidden" name="userId" value={member.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button
                        type="submit"
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          status === "rejected"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-bg border-border-gold/30 text-muted hover:border-red-500/50 hover:text-red-400"
                        }`}
                      >
                        Absent
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
