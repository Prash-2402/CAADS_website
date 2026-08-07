"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeAttendance } from "@/app/admin/scan/actions";
import { Trash2 } from "lucide-react";

export function RemoveAttendanceButton({
  eventId,
  userId,
  name,
}: {
  eventId: string;
  userId: string;
  name: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    if (!confirm(`Are you sure you want to remove attendance record for ${name}?`)) {
      return;
    }
    startTransition(async () => {
      const res = await removeAttendance(eventId, userId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to remove attendance.");
      }
    });
  };

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
      title="Remove attendance entry"
    >
      <Trash2 size={16} />
    </button>
  );
}
