import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Check, X, FileSpreadsheet, AlertCircle } from "lucide-react";
import { approveYellowForm, rejectYellowForm } from "./actions";

export const metadata = {
  title: "Yellow Forms Hub - CAADS",
};

export default async function YellowFormsHubPage() {
  const supabase = createClient();

  // Fetch all yellow forms with related profiles and events
  const { data: yellowForms } = await supabase
    .from("yellow_forms")
    .select(`
      id,
      periods,
      status,
      created_at,
      profiles (
        full_name,
        reg_no
      ),
      events (
        title
      )
    `)
    .order("created_at", { ascending: false });

  const handleApprove = async (formData: FormData) => {
    "use server";
    const id = formData.get("id") as string;
    await approveYellowForm(id);
  };

  const handleReject = async (formData: FormData) => {
    "use server";
    const id = formData.get("id") as string;
    await rejectYellowForm(id);
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-muted hover:text-ivory transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold text-ivory">Yellow Forms Hub</h1>
            <p className="font-body text-muted mt-1">Review and authorize attendance duty leaves.</p>
          </div>
        </div>

        {/* Excel Export Action */}
        <Link
          href="/api/export?type=yellow_forms"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gold/10 text-gold border border-gold hover:bg-gold hover:text-bg font-semibold text-sm transition-all self-start sm:self-center"
        >
          <FileSpreadsheet size={18} />
          Export All to Excel
        </Link>
      </div>

      <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-gold/30 text-muted font-display text-xs uppercase tracking-wider">
                <th className="pb-4 font-semibold">Student</th>
                <th className="pb-4 font-semibold">Reg No</th>
                <th className="pb-4 font-semibold">Event Context</th>
                <th className="pb-4 font-semibold">Periods Missed</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gold/20 font-body text-sm text-ivory">
              {yellowForms?.map((yf) => {
                const profile = yf.profiles as any;
                const event = yf.events as any;
                if (!profile || !event) return null;

                return (
                  <tr key={yf.id} className="hover:bg-bg/40 transition-colors">
                    <td className="py-4 font-semibold">{profile.full_name}</td>
                    <td className="py-4 text-muted font-mono">{profile.reg_no || "N/A"}</td>
                    <td className="py-4 font-semibold text-muted">{event.title}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        {yf.periods.map((p: string) => (
                          <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20 font-mono">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        yf.status === "approved" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        yf.status === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}>
                        {yf.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {yf.status === "pending" && (
                        <div className="flex justify-end items-center gap-2">
                          <form action={handleApprove}>
                            <input type="hidden" name="id" value={yf.id} />
                            <button
                              type="submit"
                              className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors border border-green-500/20"
                              title="Approve request"
                            >
                              <Check size={16} />
                            </button>
                          </form>
                          <form action={handleReject}>
                            <input type="hidden" name="id" value={yf.id} />
                            <button
                              type="submit"
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-red-500/20"
                              title="Reject request"
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
              {(!yellowForms || yellowForms.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    No yellow form requests found.
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
