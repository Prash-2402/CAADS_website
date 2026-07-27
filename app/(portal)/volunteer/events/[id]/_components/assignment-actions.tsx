"use client";

import { useState } from "react";
import { updateAssignmentStatusAction } from "../../../actions";
import { CheckCircle2, XCircle } from "lucide-react";

export function AssignmentActions({ 
  eventId, 
  currentStatus 
}: { 
  eventId: string; 
  currentStatus: "invited" | "accepted" | "declined" 
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(status: "accepted" | "declined") {
    setIsPending(true);
    setError(null);
    const result = await updateAssignmentStatusAction(eventId, status);
    if (result.error) {
      setError(result.error);
    }
    setIsPending(false);
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
        <div className="bg-bg p-4 rounded-xl border border-border-gold/30">
          <p className="font-body text-sm text-muted mb-3">
            You have <strong className={currentStatus === "accepted" ? "text-green-400" : "text-red-400"}>{currentStatus}</strong> this assignment.
          </p>
          <button
            onClick={() => handleAction(currentStatus === "accepted" ? "declined" : "accepted")}
            disabled={isPending}
            className="text-xs font-semibold text-ivory/70 hover:text-gold transition-colors underline underline-offset-4"
          >
            Change my response to {currentStatus === "accepted" ? "Decline" : "Accept"}
          </button>
        </div>
      )}
    </div>
  );
}
