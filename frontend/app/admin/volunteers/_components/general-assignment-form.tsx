"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGeneralAssignment } from "../actions";
import { UserPlus, Zap, X } from "lucide-react";

type EventItem   = { id: string; title: string; date: string };
type ProfileItem = { id: string; full_name: string; reg_no: string | null; role: string };

export function GeneralAssignmentForm({
  profiles,
  events,
}: {
  profiles: ProfileItem[];
  events: EventItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [date, setDate]           = useState("");
  const [userId, setUserId]       = useState("");
  const [role, setRole]           = useState("Coordinator");
  const [duration, setDuration]   = useState("2 hours");
  const [purpose, setPurpose]     = useState<"event" | "general">("general");
  const [eventId, setEventId]     = useState("");
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  // Events that fall on the chosen date
  const eventsOnDate = events.filter((e) => e.date === date);

  function reset() {
    setDate(""); setUserId(""); setRole("Coordinator"); setDuration("2 hours");
    setPurpose("general"); setEventId(""); setError(""); setSuccess("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !userId || !role.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (purpose === "event" && !eventId) {
      setError("Please select an event.");
      return;
    }
    setError(""); setSuccess("");

    startTransition(async () => {
      const result = await createGeneralAssignment({
        userId,
        date,
        role,
        purpose,
        eventId: purpose === "event" ? eventId : undefined,
        duration,
      });

      if (result.success) {
        setSuccess("Assignment created successfully!");
        reset();
        router.refresh();
      } else {
        setError(result.error || "Failed to create assignment.");
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
        New Assignment
      </button>
    );
  }

  return (
    <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-ivory text-xl">New Date-Based Assignment</h3>
        <button
          type="button"
          onClick={() => { setIsOpen(false); reset(); }}
          className="text-muted hover:text-ivory transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {error   && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>}
      {success && <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPurpose("general");
                setEventId("");
              }}
              required
              className="w-full bg-bg border border-border-gold/50 rounded-lg px-3 py-2.5 text-ivory text-sm focus:outline-none focus:border-gold transition-colors"
            />
            {eventsOnDate.length > 0 && (
              <p className="text-[10px] text-gold mt-1.5 flex items-center gap-1">
                <Zap size={9} />
                {eventsOnDate.length} event{eventsOnDate.length > 1 ? "s" : ""} on this date
              </p>
            )}
          </div>

          {/* Volunteer */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Volunteer *
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="w-full bg-bg border border-border-gold/50 rounded-lg px-3 py-2.5 text-ivory text-sm focus:outline-none focus:border-gold transition-colors"
            >
              <option value="">Select a volunteer...</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.role.replace("_", " ")})
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Duty / Role *
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Coordinator, Logistics"
              required
              className="w-full bg-bg border border-border-gold/50 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Expected Duration
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 2 hours, Full day"
              className="w-full bg-bg border border-border-gold/50 rounded-lg px-3 py-2.5 text-ivory text-sm placeholder:text-muted/40 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        {/* Purpose selector — only shown when events exist on the date */}
        {eventsOnDate.length > 0 && (
          <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gold uppercase tracking-wider">
              Purpose — Events exist on this date
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="purpose"
                  value="general"
                  checked={purpose === "general"}
                  onChange={() => { setPurpose("general"); setEventId(""); }}
                  className="accent-gold"
                />
                <span className="text-sm text-ivory group-hover:text-gold transition-colors">
                  General Duty (independent of any event)
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="purpose"
                  value="event"
                  checked={purpose === "event"}
                  onChange={() => setPurpose("event")}
                  className="accent-gold"
                />
                <span className="text-sm text-ivory group-hover:text-gold transition-colors">
                  For a specific event
                </span>
              </label>
            </div>

            {purpose === "event" && (
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full bg-bg border border-border-gold/50 rounded-lg px-3 py-2.5 text-ivory text-sm focus:outline-none focus:border-gold transition-colors"
              >
                <option value="">Select event on this date...</option>
                {eventsOnDate.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-bg font-semibold text-sm hover:bg-gold-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={16} />
            {isPending ? "Creating..." : "Create Assignment"}
          </button>
          <button
            type="button"
            onClick={() => { setIsOpen(false); reset(); }}
            className="px-6 py-3 rounded-xl border border-border-gold text-muted hover:text-ivory hover:border-gold transition-colors text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
