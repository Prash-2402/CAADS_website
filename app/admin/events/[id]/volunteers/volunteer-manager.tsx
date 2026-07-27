"use client";

import { useState, useTransition } from "react";
import { inviteVolunteer, removeVolunteerAssignment } from "../../actions";
import { Search, UserPlus, Trash2, Mail, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

type VolunteerManagerProps = {
  eventId: string;
  eventTitle: string;
  profiles: any[];
  assignments: any[];
  activityStats: Record<string, number>;
};

export default function VolunteerManager({
  eventId,
  eventTitle,
  profiles,
  assignments,
  activityStats,
}: VolunteerManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states for inviting a volunteer
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("Coordinator");
  const [duration, setDuration] = useState("2 hours");

  // Draft email state
  const [draftEmail, setDraftEmail] = useState<{ subject: string; body: string } | null>(null);

  // Group current assignments by user_id for quick checks
  const assignedMap = new Map(
    assignments.map((a) => [a.user_id, { role: a.role, duration: a.expected_duration, status: a.status, name: a.profiles?.full_name }])
  );

  // Filter profiles for invitation dropdown/search
  const availableProfiles = profiles.filter(
    (p) => !assignedMap.has(p.id) && p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError("Please select a volunteer.");
      return;
    }

    setError("");
    setSuccess("");
    startTransition(async () => {
      const res = await inviteVolunteer({
        eventId,
        userId: selectedUserId,
        role,
        expectedDuration: duration,
      });

      if (res.success) {
        setSuccess("Volunteer invited successfully!");
        const vol = profiles.find((p) => p.id === selectedUserId);
        generateDraftEmail(vol?.full_name || "Volunteer", role, duration);
        setSelectedUserId("");
      } else {
        setError(res.error || "Failed to invite volunteer");
      }
    });
  };

  const handleRemove = (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this event?`)) {
      return;
    }

    setError("");
    setSuccess("");
    startTransition(async () => {
      const res = await removeVolunteerAssignment(eventId, userId);
      if (res.success) {
        setSuccess("Volunteer removed successfully!");
        setDraftEmail(null);
      } else {
        setError(res.error || "Failed to remove volunteer");
      }
    });
  };

  const generateDraftEmail = (name: string, volRole: string, volDuration: string) => {
    // Stub AI drafting (Prompt 12 requirement)
    // We will wire this to Gemini in Prompt 16/Assistant.
    const subject = `[CAADS] Invitation to Volunteer: ${eventTitle}`;
    const body = `Hi ${name},\n\nYou have been invited to volunteer as a "${volRole}" for our upcoming event, "${eventTitle}".\n\nExpected Duration: ${volDuration}\n\nPlease log in to your CAADS Volunteer Portal to accept or decline this assignment.\n\nBest regards,\nCAADS Core Team`;
    setDraftEmail({ subject, body });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Columns - Current Assignments */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-xl font-bold text-ivory mb-6">Assigned Volunteers ({assignments.length})</h2>

          {success && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-body flex items-center gap-2">
              <CheckCircle2 size={16} />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-body flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="divide-y divide-border-gold/20">
            {assignments.map((assign) => (
              <div key={assign.user_id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-semibold text-ivory">{assign.profiles?.full_name}</h4>
                    <span className="text-xs text-muted">
                      ({activityStats[assign.user_id] || 0} assignments total)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted mt-1 font-body">
                    <span>Role: <strong className="text-gold">{assign.role}</strong></span>
                    <span>Duration: <strong>{assign.expected_duration}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Status Badge */}
                  {assign.status === "accepted" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold">
                      <CheckCircle2 size={14} /> Accepted
                    </span>
                  ) : assign.status === "declined" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
                      <XCircle size={14} /> Declined
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-semibold">
                      <Clock size={14} /> Invited
                    </span>
                  )}

                  <button
                    onClick={() => handleRemove(assign.user_id, assign.profiles?.full_name)}
                    disabled={isPending}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove Assignment"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {assignments.length === 0 && (
              <p className="text-muted text-sm py-4 text-center">No volunteers assigned to this event yet.</p>
            )}
          </div>
        </div>

        {/* AI Draft Email Panel */}
        {draftEmail && (
          <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-border-gold/20 pb-4">
              <h3 className="font-display font-semibold text-gold text-lg flex items-center gap-2">
                <Mail size={20} />
                Draft Invite Email (AI Draft)
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${draftEmail.subject}\n\n${draftEmail.body}`);
                  alert("Copied to clipboard!");
                }}
                className="px-3 py-1 bg-bg border border-border-gold/50 rounded-lg text-xs text-ivory hover:border-gold transition-colors font-body"
              >
                Copy Text
              </button>
            </div>
            <div className="space-y-3 font-mono text-sm text-ivory">
              <div>
                <span className="text-muted">Subject:</span> {draftEmail.subject}
              </div>
              <div className="p-4 bg-bg border border-border-gold/30 rounded-xl whitespace-pre-line text-muted">
                {draftEmail.body}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Selection & Invite form */}
      <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 h-fit space-y-6">
        <h3 className="font-display text-lg font-bold text-ivory">Invite Volunteer</h3>

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ivory font-display">
              Search &amp; Select
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg border border-border-gold/30 rounded-xl pl-9 pr-4 py-3 text-ivory placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all font-body text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory focus:border-gold outline-none transition-all font-body text-sm"
            >
              <option value="">-- Choose Volunteer --</option>
              {availableProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-ivory font-display">
              Assigned Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              placeholder="e.g. Coordinator, Technical Lead"
              className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory focus:border-gold outline-none transition-all font-body text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-ivory font-display">
              Expected Duration
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              placeholder="e.g. 2 hours, Full Day"
              className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory focus:border-gold outline-none transition-all font-body text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !selectedUserId}
            className="w-full py-3 px-4 rounded-xl bg-gold hover:bg-gold-bright text-bg font-semibold text-center transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus size={18} />
            {isPending ? "Inviting..." : "Assign Volunteer"}
          </button>
        </form>
      </div>
    </div>
  );
}
