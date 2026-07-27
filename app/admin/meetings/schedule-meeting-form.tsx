"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createMeeting } from "./actions";
import { useEffect, useRef } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 rounded-xl bg-gold hover:bg-gold-bright text-bg font-semibold text-center transition-colors text-sm disabled:opacity-50"
    >
      {pending ? "Scheduling..." : "Schedule Meeting"}
    </button>
  );
}

export default function ScheduleMeetingForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(createMeeting, { success: false, error: "" });

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
          Meeting scheduled successfully!
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="title" className="block text-xs font-medium text-ivory font-display">
          Meeting Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          placeholder="e.g. Core Committee Sync"
          className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-2.5 text-ivory placeholder-muted focus:border-gold outline-none transition-all font-body text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="date" className="block text-xs font-medium text-ivory font-display">
          Date &amp; Time *
        </label>
        <input
          type="datetime-local"
          id="date"
          name="date"
          required
          className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-2.5 text-ivory focus:border-gold outline-none transition-all font-body text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="agenda" className="block text-xs font-medium text-ivory font-display">
          Agenda / Topics
        </label>
        <textarea
          id="agenda"
          name="agenda"
          rows={3}
          placeholder="What will we discuss?"
          className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-2.5 text-ivory placeholder-muted focus:border-gold outline-none transition-all font-body text-sm resize-none"
        />
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
