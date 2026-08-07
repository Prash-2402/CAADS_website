"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAssignmentStatusAction, releaseVolunteerAssignmentAction } from "../../../actions";
import { CheckCircle2, XCircle, LogOut } from "lucide-react";

export function AssignmentActions({ 
  eventId, 
  currentStatus 
}: { 
  eventId: string; 
  currentStatus: "invited" | "accepted" | "declined" | "completed"
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(status: "accepted" | "declined") {
    setIsPending(true);
    setError(null);
    const result = await updateAssignmentStatusAction(eventId, status);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh(); // re-render page so currentStatus prop updates
    }
    setIsPending(false);
  }

  async function handleRelease() {
    if (!confirm("Are you sure you want to complete and release your volunteer duty for this event?")) {
      return;
    }
    setIsPending(true);
    setError(null);
    const result = await releaseVolunteerAssignmentAction(eventId);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh(); // re-render page so "Duty Completed" banner appears
    }
    setIsPending(false);
  }

  if (currentStatus === "completed") {
    return (
      <div className="bg-gold/10 border border-gold/40 p-5 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-gold font-display font-bold text-base">
          <CheckCircle2 size={20} />
          Duty Completed &amp; Released
        </div>
        <p className="font-body text-xs text-muted">
          Your volunteer duty for this event has been marked as completed. Thank you for your service!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {currentStatus === "invited" ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => handleAction("accepted")}
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors font-semibold disabled:opacity-50"
          >
            <CheckCircle2 size={18} />
            {isPending ? "Updating..." : "Accept Assignment"}
          </button>
          
          <button
            onClick={() => handleAction("declined")}
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors font-semibold disabled:opacity-50"
          >
            <XCircle size={18} />
            {isPending ? "Updating..." : "Decline"}
          </button>
        </div>
      ) : (
        <div className="bg-bg p-5 rounded-xl border border-border-gold/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-body text-sm text-muted">
                Status: <strong className={currentStatus === "accepted" ? "text-green-400" : "text-red-400"}>{currentStatus.toUpperCase()}</strong>
              </p>
            </div>
            
            {currentStatus === "accepted" && (
              <button
                onClick={handleRelease}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 text-gold border border-gold/40 hover:bg-gold hover:text-bg transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                <LogOut size={14} />
                {isPending ? "Releasing..." : "Free / Complete Duty (Work Done)"}
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-border-gold/20">
            <button
              onClick={() => handleAction(currentStatus === "accepted" ? "declined" : "accepted")}
              disabled={isPending}
              className="text-xs font-semibold text-ivory/70 hover:text-gold transition-colors underline underline-offset-4"
            >
              Change my response to {currentStatus === "accepted" ? "Decline" : "Accept"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

