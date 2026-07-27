"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addDocument } from "./actions";
import { useEffect, useRef, useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 rounded-xl bg-gold hover:bg-gold-bright text-bg font-semibold text-center transition-colors text-sm disabled:opacity-50"
    >
      {pending ? "Linking..." : "Link Document"}
    </button>
  );
}

export default function AddDocumentForm({
  events,
  meetings,
}: {
  events: any[];
  meetings: any[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [linkType, setLinkType] = useState<"event" | "meeting">("event");
  const [state, formAction] = useFormState(addDocument, { success: false, error: "" });

  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-body">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-body">
          Document linked successfully!
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="driveLink" className="block text-xs font-medium text-ivory font-display">
          Google Drive Link *
        </label>
        <input
          type="url"
          id="driveLink"
          name="driveLink"
          required
          placeholder="e.g. https://drive.google.com/..."
          className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-2.5 text-ivory placeholder-muted focus:border-gold outline-none transition-all font-body text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-ivory font-display">
          Link Context
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLinkType("event")}
            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
              linkType === "event"
                ? "bg-gold/10 border-gold text-gold"
                : "bg-bg border-border-gold/30 text-muted"
            }`}
          >
            Club Event
          </button>
          <button
            type="button"
            onClick={() => setLinkType("meeting")}
            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
              linkType === "meeting"
                ? "bg-gold/10 border-gold text-gold"
                : "bg-bg border-border-gold/30 text-muted"
            }`}
          >
            Club Meeting
          </button>
        </div>
      </div>

      {linkType === "event" ? (
        <div className="space-y-1">
          <label htmlFor="eventId" className="block text-xs font-medium text-ivory font-display">
            Select Event *
          </label>
          <select
            id="eventId"
            name="eventId"
            required
            className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-2.5 text-ivory focus:border-gold outline-none transition-all font-body text-sm"
          >
            <option value="">-- Select Event --</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-1">
          <label htmlFor="meetingId" className="block text-xs font-medium text-ivory font-display">
            Select Meeting *
          </label>
          <select
            id="meetingId"
            name="meetingId"
            required
            className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-2.5 text-ivory focus:border-gold outline-none transition-all font-body text-sm"
          >
            <option value="">-- Select Meeting --</option>
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
