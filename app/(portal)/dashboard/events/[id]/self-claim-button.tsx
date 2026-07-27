"use client";

import { useTransition, useState } from "react";
import { submitSelfClaim } from "@/app/admin/scan/actions";
import { ClipboardCheck } from "lucide-react";
import { useRouter } from "next/navigation";

type SelfClaimButtonProps = {
  eventId: string;
};

export default function SelfClaimButton({ eventId }: SelfClaimButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSelfClaim = () => {
    setError("");
    startTransition(async () => {
      const res = await submitSelfClaim(eventId);
      if (res.success) {
        router.refresh();
      } else {
        setError(res.error || "Failed to submit self claim");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <span className="text-xs text-red-400 font-body">{error}</span>}
      <button
        onClick={handleSelfClaim}
        disabled={isPending}
        className="inline-flex justify-center items-center gap-1.5 px-4 py-2 rounded-xl bg-gold/10 text-gold border border-gold hover:bg-gold hover:text-bg transition-all text-sm font-semibold whitespace-nowrap disabled:opacity-50"
      >
        <ClipboardCheck size={16} />
        {isPending ? "Claiming..." : "Self Claim Attendance"}
      </button>
    </div>
  );
}
