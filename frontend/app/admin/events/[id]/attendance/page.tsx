import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, FileSpreadsheet, Clock } from "lucide-react";
import { approveAttendanceClaim, rejectAttendanceClaim } from "@/app/admin/scan/actions";
import { ManualAttendanceForm } from "./_components/manual-attendance-form";
import { RemoveAttendanceButton } from "./_components/remove-attendance-button";

export const metadata = {
  title: "Event Attendance - CAADS",
};

export default async function EventAttendancePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Fetch event details
  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", params.id)
    .single();

  if (!event) {
    notFound();
  }

  // Fetch all profiles for manual entry dropdown
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, reg_no, role")
    .order("full_name");

  // Fetch all registrations for this event
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(`
      user_id,
      registered_at,
      profiles (
        full_name,
        reg_no,
        role
      )
    `)
    .eq("event_id", params.id);

  // Fetch all attendance logs for this event
  const { data: attendanceLogs, error: attendanceError } = await supabase
    .from("attendance")
    .select(`
      user_id, 
      method, 
      status, 
      check_in_time,
      periods_present,
      updated_at,
      profiles!attendance_user_id_fkey (
        full_name,
        reg_no,
        role
      )
    `)
    .eq("event_id", params.id);

  if (attendanceError) {
    console.error("Error fetching attendance logs:", attendanceError);
  }

  // Combine registrations and attendance into a single list
  const userMap = new Map();

  registrations?.forEach((reg) => {
    userMap.set(reg.user_id, {
      userId: reg.user_id,
      profile: reg.profiles,
      att: null,
      isRegistered: true,
    });
  });

  attendanceLogs?.forEach((log) => {
    if (userMap.has(log.user_id)) {
      userMap.get(log.user_id).att = log;
    } else {
      userMap.set(log.user_id, {
        userId: log.user_id,
        profile: log.profiles,
        att: log,
        isRegistered: false,
      });
    }
  });

  const allAttendees = Array.from(userMap.values());

  // Proper server action wrappers that read userId from form data
  const doApprove = async (formData: FormData) => {
    "use server";
    const userId = formData.get("userId") as string;
    if (userId) await approveAttendanceClaim(params.id, userId);
  };

  const doReject = async (formData: FormData) => {
    "use server";
    const userId = formData.get("userId") as string;
    if (userId) await rejectAttendanceClaim(params.id, userId);
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/events" className="text-muted hover:text-ivory transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold text-ivory">Event Attendance</h1>
            <p className="font-body text-muted mt-1">Verify, approve, and manage check-ins for &quot;{event.title}&quot;.</p>
          </div>
        </div>

        {/* Excel Export Action */}
        <div className="flex gap-3">
          <Link
            href={`/api/export?event_id=${event.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gold/10 text-gold border border-gold hover:bg-gold hover:text-bg font-semibold text-sm transition-all"
          >
            <FileSpreadsheet size={18} />
            Export to Excel
          </Link>
        </div>
      </div>

      {/* Manual Attendance Entry Component */}
      <ManualAttendanceForm
        eventId={event.id}
        profiles={(allProfiles ?? []).map((p) => ({
          id: p.id,
          full_name: p.full_name,
          reg_no: p.reg_no,
          role: p.role,
        }))}
      />

      {/* Attendance approval list */}
      <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8">
        <h2 className="font-display text-xl font-bold text-ivory mb-6">Attendee Status Checklist</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-gold/30 text-muted font-display text-xs uppercase tracking-wider">
                <th className="pb-4 font-semibold">Name</th>
                <th className="pb-4 font-semibold">Reg No</th>
                <th className="pb-4 font-semibold">Club Role</th>
                <th className="pb-4 font-semibold">Method</th>
                <th className="pb-4 font-semibold">Check-in Time</th>
                <th className="pb-4 font-semibold">Periods</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gold/20 font-body text-sm text-ivory">
              {allAttendees.map((attendee) => {
                const { userId, profile, att } = attendee;
                if (!profile) return null;

                const checkInDate = att?.check_in_time ? new Date(att.check_in_time) : null;
                const checkInFormatted = checkInDate
                  ? checkInDate.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Kolkata",
                    })
                  : null;

                const periods: string[] = att?.periods_present || [];

                return (
                  <tr key={userId} className="hover:bg-bg/40 transition-colors">
                    <td className="py-4 font-semibold">{profile.full_name}</td>
                    <td className="py-4 text-muted font-mono">{profile.reg_no || "N/A"}</td>
                    <td className="py-4 text-muted capitalize">{profile.role?.replace("_", " ") || "Student"}</td>
                    <td className="py-4 text-muted font-mono text-xs">
                      {att ? (
                        att.method === "qr_self" ? "Self QR Scan" :
                        att.method === "staff_scan" ? "Staff Scan" :
                        att.method === "manual" ? "Manual Entry" :
                        "Self Claim"
                      ) : (
                        "Absent"
                      )}
                    </td>
                    <td className="py-4 text-muted text-xs">
                      {checkInFormatted ? (
                        <span className="flex items-center gap-1 text-green-400 font-mono">
                          <Clock size={12} />
                          {checkInFormatted}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-4">
                      {periods.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {periods.map((p) => (
                            <span key={p} className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold/20 text-gold border border-gold/30">
                              {p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4">
                      {att ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          att.status === "approved" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          att.status === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}>
                          {att.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 text-xs font-semibold">
                          Not Checked In
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {att?.status === "pending" && (
                          <>
                            <form action={doApprove}>
                              <input type="hidden" name="userId" value={userId} />
                              <button
                                type="submit"
                                className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors border border-green-500/20"
                                title="Approve check-in"
                              >
                                <Check size={16} />
                              </button>
                            </form>
                            <form action={doReject}>
                              <input type="hidden" name="userId" value={userId} />
                              <button
                                type="submit"
                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-red-500/20"
                                title="Reject claim"
                              >
                                <X size={16} />
                              </button>
                            </form>
                          </>
                        )}
                        {att && (
                          <RemoveAttendanceButton
                            eventId={event.id}
                            userId={userId}
                            name={profile.full_name}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {allAttendees.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted">
                    No registrations or check-ins found for this event.
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
