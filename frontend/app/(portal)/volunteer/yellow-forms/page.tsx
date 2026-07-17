import { getProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format, parseISO } from "date-fns";
import { FileText, CheckCircle2, Clock, XCircle, Calendar } from "lucide-react";
import type { Metadata } from "next";
import { RequestForm } from "./_components/request-form";

export const metadata: Metadata = {
  title: "Yellow Forms",
};

export default async function YellowFormsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  if (!["volunteer", "core_team", "admin"].includes(profile.role)) {
    redirect("/dashboard");
  }

  const supabase = createClient();

  // Fetch past requests
  const { data: requests } = await supabase
    .from("yellow_forms")
    .select(`
      id,
      status,
      periods,
      created_at,
      events (
        title,
        date
      )
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  // Fetch valid events to request for (events user is registered for or assigned to)
  // For simplicity, we'll allow them to request for any public event they are registered for.
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(`
      events (
        id,
        title,
        date
      )
    `)
    .eq("user_id", profile.id);

  // Filter out null events and map
  // @ts-ignore
  const registeredEvents = (registrations || []).map(r => r.events).filter(Boolean);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-ivory">Yellow Forms</h1>
        <p className="font-body text-muted mt-1">Request and track attendance exemption forms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 shadow-gold sticky top-24">
            <h2 className="font-display text-xl font-bold text-ivory mb-6">New Request</h2>
            
            {registeredEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-body text-sm text-muted">You must be registered for an event to request a yellow form.</p>
              </div>
            ) : (
              <RequestForm events={registeredEvents as any[]} />
            )}
          </div>
        </div>

        {/* Request History */}
        <div className="lg:col-span-2">
          <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 shadow-gold">
            <h2 className="font-display text-xl font-bold text-ivory mb-6 flex items-center gap-2">
              <FileText className="text-gold" size={24} />
              Request History
            </h2>

            <div className="space-y-4">
              {requests?.map((req) => {
                // @ts-ignore
                const event = req.events as any;
                if (!event) return null;

                return (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border-gold/30 bg-bg">
                    <div>
                      <h3 className="font-display font-semibold text-ivory text-lg">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(parseISO(event.date), "MMM d, yyyy")}
                        </span>
                        <span>
                          Periods: <strong className="text-ivory/80">{req.periods.join(", ")}</strong>
                        </span>
                      </div>
                    </div>

                    <div>
                      {req.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold">
                          <CheckCircle2 size={14} /> Approved
                        </span>
                      ) : req.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-semibold">
                          <Clock size={14} /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
                          <XCircle size={14} /> Rejected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {(!requests || requests.length === 0) && (
                <div className="py-12 text-center border border-dashed border-border-gold rounded-xl">
                  <p className="text-muted font-body">No yellow form requests found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
