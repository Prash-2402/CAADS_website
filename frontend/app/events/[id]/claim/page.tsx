import { claimEventAttendance } from "@/app/admin/scan/actions";
import Link from "next/link";
import { CheckCircle2, XCircle, LayoutDashboard } from "lucide-react";
import { getProfile } from "@/lib/supabase/auth";

export const metadata = {
  title: "Event Check-In - CAADS",
};

export default async function ClaimAttendancePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { secret?: string };
}) {
  const profile = await getProfile();
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-bg-secondary border border-border-gold rounded-2xl p-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center mx-auto">
            <XCircle size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-ivory">Authentication Required</h1>
            <p className="font-body text-sm text-muted">
              You must log in to register your attendance for this event.
            </p>
          </div>
          <Link
            href={`/login?redirectTo=/events/${params.id}/claim?secret=${searchParams.secret || ""}`}
            className="block w-full py-3 rounded-xl bg-gold text-bg font-semibold hover:bg-gold-bright transition-colors text-sm"
          >
            Log In &amp; Check In
          </Link>
        </div>
      </div>
    );
  }

  const secret = searchParams.secret || "";
  const res = await claimEventAttendance(params.id, secret);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-bg-secondary border border-border-gold rounded-2xl p-6 text-center space-y-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${res.success ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {res.success ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-ivory">
            {res.success ? "Check-in Successful" : "Check-in Failed"}
          </h1>
          <p className="font-body text-sm text-muted">
            {res.success
              ? "Your attendance has been registered and verified successfully."
              : res.error || "An error occurred during verification."}
          </p>
        </div>

        <div className="pt-4 border-t border-border-gold/20 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full py-3 rounded-xl bg-gold text-bg font-semibold hover:bg-gold-bright transition-colors text-sm flex items-center justify-center gap-2"
          >
            <LayoutDashboard size={18} />
            Go to Student Dashboard
          </Link>
          <Link
            href="/"
            className="w-full py-3 rounded-xl bg-bg border border-border-gold/50 text-ivory hover:bg-gold/10 transition-colors text-sm"
          >
            Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
