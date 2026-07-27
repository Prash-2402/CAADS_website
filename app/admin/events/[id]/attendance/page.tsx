import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, FileSpreadsheet, Sparkles } from "lucide-react";
import { approveAttendanceClaim, rejectAttendanceClaim } from "@/app/admin/scan/actions";
import { revalidatePath } from "next/cache";

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
  const { data: attendanceLogs } = await supabase
    .from("attendance")
    .select("user_id, method, status, updated_at")
    .eq("event_id", params.id);

  // Map attendance logs by user_id
  const attendanceMap = new Map(attendanceLogs?.map((a) => [a.user_id, a]));

  const handleApprove = async (formData: FormData) => {
    "use server";
    const userId = formData.get("userId") as string;
    await approveAttendanceClaim(params.id, userId);
  };

  const handleReject = async (formData: FormData) => {
    "use server";
    const userId = formData.get("userId") as string;
    await rejectAttendanceClaim(params.id, userId);
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
            <p className="font-body text-muted mt-1">Verify and approve check-ins for &quot;{event.title}&quot;.</p>
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
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gold/20 font-body text-sm text-ivory">
              {registrations?.map((reg) => {
                const profile = reg.profiles as any;
                if (!profile) return null;

                const att = attendanceMap.get(reg.user_id);

                return (
                  <tr key={reg.user_id} className="hover:bg-bg/40 transition-colors">
                    <td className="py-4 font-semibold">{profile.full_name}</td>
                    <td className="py-4 text-muted font-mono">{profile.reg_no || "N/A"}</td>
                    <td className="py-4 text-muted capitalize">{profile.role.replace("_", " ")}</td>
                    <td className="py-4 text-muted font-mono text-xs">
                      {att ? (
                        att.method === "qr_self" ? "Self QR Scan" :
                        att.method === "staff_scan" ? "Staff Scan" :
                        "Self Claim"
                      ) : (
                        "Absent"
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
                          not check-in
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {att?.status === "pending" && (
                        <div className="flex justify-end items-center gap-2">
                          <form action={handleApprove}>
                            <input type="hidden" name="userId" value={reg.user_id} />
                            <button
                              type="submit"
                              className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors border border-green-500/20"
                              title="Approve check-in"
                            >
                              <Check size={16} />
                            </button>
                          </form>
                          <form action={handleReject}>
                            <input type="hidden" name="userId" value={reg.user_id} />
                            <button
                              type="submit"
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-red-500/20"
                              title="Reject claim"
                            >
                              <X size={16} />
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(!registrations || registrations.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    No registrations found for this event.
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
