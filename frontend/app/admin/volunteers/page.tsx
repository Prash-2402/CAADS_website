import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getRole } from "@/lib/supabase/auth";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, Trash2, UserCheck2, ExternalLink } from "lucide-react";
import { GeneralAssignmentForm } from "./_components/general-assignment-form";
import { removeGeneralAssignment } from "./actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "All Volunteers – CAADS Admin" };

const STATUS_CLASSES: Record<string, string> = {
  invited:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  accepted:  "bg-green-500/10  text-green-400  border-green-500/20",
  completed: "bg-gold/10       text-gold        border-gold/30",
  declined:  "bg-red-500/10   text-red-400    border-red-500/20",
};

export default async function VolunteersPage() {
  const role = await getRole();
  if (role !== "core_team" && role !== "admin") redirect("/admin");

  const supabase = createClient();

  // Fetch all staff-eligible profiles for the assignment form
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, reg_no, role")
    .in("role", ["volunteer", "core_team", "admin"])
    .order("full_name");

  // Fetch all events for date-event matching in the form
  const { data: events } = await supabase
    .from("events")
    .select("id, title, date")
    .order("date", { ascending: true });

  // Fetch all assignments — both event-specific and date-based
  const { data: assignments, error } = await supabase
    .from("volunteer_assignments")
    .select(`
      id,
      user_id,
      event_id,
      assignment_date,
      role,
      purpose,
      status,
      check_in_time,
      expected_duration,
      profiles!volunteer_assignments_user_id_fkey (
        full_name,
        reg_no,
        role
      ),
      events (
        id,
        title,
        date
      )
    `)
    .order("assignment_date", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[Volunteers Page] fetch error:", error.message);
  }

  // Group assignments by display date
  const grouped = new Map<string, typeof assignments>();
  (assignments ?? []).forEach((a) => {
    const dateKey =
      a.assignment_date ??
      ((a.events as any)?.date as string | undefined) ??
      "unknown";
    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
    grouped.get(dateKey)!.push(a as any);
  });

  const sortedDates = Array.from(grouped.keys()).sort((x, y) => y.localeCompare(x));

  // Named server action for removing assignments
  const doRemove = async (formData: FormData) => {
    "use server";
    const id = formData.get("id") as string;
    if (id) await removeGeneralAssignment(id);
  };

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">All Volunteers</h1>
          <p className="font-body text-muted mt-1">
            Manage event-specific and general date-based volunteer assignments.
          </p>
        </div>
      </div>

      {/* Assignment form (client component) */}
      <GeneralAssignmentForm
        profiles={(profiles ?? []).map((p) => ({
          id:        p.id,
          full_name: p.full_name,
          reg_no:    p.reg_no,
          role:      p.role,
        }))}
        events={(events ?? []).map((e) => ({
          id:    e.id,
          title: e.title,
          date:  e.date,
        }))}
      />

      {/* Assignments grouped by date */}
      <div className="space-y-5">
        {sortedDates.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border-gold rounded-2xl">
            <UserCheck2 size={40} className="text-muted mx-auto mb-3 opacity-50" />
            <p className="font-body text-muted">No volunteer assignments yet.</p>
            <p className="text-xs text-muted/60 mt-1">
              Use the form above to create the first assignment.
            </p>
          </div>
        )}

        {sortedDates.map((dateKey) => {
          const dayList = grouped.get(dateKey)!;
          const formattedDate =
            dateKey !== "unknown"
              ? format(parseISO(dateKey), "EEEE, MMMM d, yyyy")
              : "Unknown Date";

          return (
            <div
              key={dateKey}
              className="bg-bg-secondary border border-border-gold rounded-2xl overflow-hidden"
            >
              {/* Date header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border-gold/30 bg-gold/5">
                <Calendar size={16} className="text-gold flex-shrink-0" />
                <h2 className="font-display font-bold text-ivory text-base flex-1">
                  {formattedDate}
                </h2>
                <span className="text-xs text-muted">
                  {dayList.length} volunteer{dayList.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Assignment rows */}
              <div className="divide-y divide-border-gold/20">
                {dayList.map((a: any) => {
                  const profile = a.profiles as { full_name: string; reg_no: string | null; role: string } | null;
                  const event   = a.events   as { id: string; title: string } | null;

                  return (
                    <div
                      key={a.id ?? `${a.event_id}-${a.user_id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gold/2 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm flex-shrink-0">
                        {profile?.full_name?.charAt(0) ?? "?"}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-body font-semibold text-ivory text-sm truncate">
                          {profile?.full_name ?? "Unknown"}
                          {profile?.reg_no && (
                            <span className="text-muted font-normal ml-2 text-xs">
                              {profile.reg_no}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="text-xs text-muted">{a.role}</span>

                          {event && (
                            <span className="text-xs text-gold flex items-center gap-1">
                              <ExternalLink size={9} />
                              {event.title}
                            </span>
                          )}

                          {a.purpose === "general" && !event && (
                            <span className="text-xs text-muted italic">General Duty</span>
                          )}

                          {a.expected_duration && a.expected_duration !== "TBD" && (
                            <span className="text-xs text-muted">{a.expected_duration}</span>
                          )}

                          {a.check_in_time && (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                              <Clock size={9} />
                              Checked in:{" "}
                              {new Date(a.check_in_time).toLocaleTimeString("en-IN", {
                                hour:   "2-digit",
                                minute: "2-digit",
                                timeZone: "Asia/Kolkata",
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status badge + remove */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border capitalize ${
                            STATUS_CLASSES[a.status] ?? "bg-muted/10 text-muted border-muted/20"
                          }`}
                        >
                          {a.status}
                        </span>

                        {a.id && (
                          <form action={doRemove}>
                            <input type="hidden" name="id" value={a.id} />
                            <button
                              type="submit"
                              className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Remove assignment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
