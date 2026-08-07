"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { manualAddAttendance } from "@/app/admin/scan/actions";
import { UserPlus, Clock, X } from "lucide-react";

type ProfileItem = {
  id: string;
  full_name: string;
  reg_no: string | null;
  role: string;
};

export function ManualAttendanceForm({
  eventId,
  profiles,
}: {
  eventId: string;
  profiles: ProfileItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const [userId, setUserId] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function reset() {
    setUserId("");
    setTimeStr("");
    setError("");
    setSuccess("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      setError("Please select a student/user.");
      return;
    }
    setError("");
    setSuccess("");

    startTransition(async () => {
      const res = await manualAddAttendance(eventId, userId, timeStr || null);
      if (res.success) {
        setSuccess(`Attendance added successfully! Periods: ${res.periods?.join(", ") || "None"}`);
        reset();
        router.refresh();
      } else {
        setError(res.error || "Failed to add attendance.");
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gold text-bg font-semibold text-sm hover:bg-gold-bright transition-colors shadow-lg"
      >
        <UserPlus size={16} />
        Manual Attendance Entry
      </button>
    );
  }

  return (
    <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-ivory text-xl">Manual Attendance Entry</h3>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            reset();
          }}
          className="text-muted hover:text-ivory transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>}
      {success && <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Select User *
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="w-full bg-bg border border-border-gold/50 rounded-lg px-3 py-2.5 text-ivory text-sm focus:outline-none focus:border-gold transition-colors"
            >
              <option value="">Choose student or member...</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.reg_no || "No Reg No"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Scan-in / Check-in Time (IST, HH:mm)
            </label>
            <div className="relative">
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full bg-bg border border-border-gold/50 rounded-lg px-3 py-2.5 text-ivory text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <p className="text-[11px] text-muted mt-1">
              Leave blank to use current time. Auto-calculates periods (P1–P6).
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-bg font-semibold text-sm hover:bg-gold-bright transition-colors disabled:opacity-50"
          >
            <UserPlus size={16} />
            {isPending ? "Adding..." : "Save Attendance"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              reset();
            }}
            className="px-6 py-2.5 rounded-xl border border-border-gold text-muted hover:text-ivory hover:border-gold transition-colors text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
