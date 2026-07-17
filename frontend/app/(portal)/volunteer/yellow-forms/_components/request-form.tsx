"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestYellowFormAction, type YellowFormState } from "../actions";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

const initialState: YellowFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="
        w-full rounded-xl bg-gold px-4 py-3
        font-body text-sm font-semibold text-bg
        hover:bg-gold-bright
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
      "
    >
      {pending ? "Submitting Request..." : "Request Yellow Form"}
    </button>
  );
}

export function RequestForm({ events }: { events: { id: string, title: string }[] }) {
  const searchParams = useSearchParams();
  const preselectedEvent = searchParams.get("event") || "";
  const [state, formAction] = useFormState(requestYellowFormAction, initialState);

  if (state.success) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl text-center space-y-3">
        <CheckCircle2 className="text-green-400 mx-auto" size={32} />
        <h3 className="font-display font-bold text-green-400 text-lg">Request Submitted</h3>
        <p className="font-body text-green-400/80 text-sm">
          Your yellow form request has been submitted and is pending approval.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="bg-red-950/40 border border-red-800 text-red-400 p-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="eventId" className="block font-body text-sm font-medium text-ivory mb-2">Select Event</label>
        <select
          id="eventId"
          name="eventId"
          defaultValue={preselectedEvent}
          required
          className="w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5 font-body text-sm text-ivory focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        >
          <option value="" disabled>Select an event...</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.title}</option>
          ))}
        </select>
        {state.fieldErrors?.eventId && <p className="text-xs text-red-400 mt-1">{state.fieldErrors.eventId[0]}</p>}
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-ivory mb-2">Periods Missed</label>
        <div className="grid grid-cols-3 gap-3">
          {["P1", "P2", "P3", "P4", "P5", "P6"].map(period => (
            <label key={period} className="flex items-center gap-2 p-3 rounded-lg border border-border-gold/30 bg-bg hover:border-gold/50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                name="periods" 
                value={period} 
                className="w-4 h-4 rounded border-border-gold text-gold focus:ring-gold bg-bg-secondary"
              />
              <span className="font-body text-sm text-ivory">{period}</span>
            </label>
          ))}
        </div>
        {state.fieldErrors?.periods && <p className="text-xs text-red-400 mt-2">{state.fieldErrors.periods[0]}</p>}
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
