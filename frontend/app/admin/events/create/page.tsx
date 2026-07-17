"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createEvent } from "../actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const initialState = {
  success: false,
  error: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 rounded-xl bg-gold text-bg font-semibold hover:bg-gold-bright transition-colors text-sm disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create Event"}
    </button>
  );
}

export default function CreateEventPage() {
  const [state, formAction] = useFormState(createEvent, initialState);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/events" className="text-muted hover:text-ivory transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">Create New Event</h1>
          <p className="font-body text-muted mt-1">Schedule a new session or workshop.</p>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8">
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-body">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-ivory font-display">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                placeholder="e.g. AI Hackathon 2026"
                className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all font-body"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-medium text-ivory font-display">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all font-body"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="time" className="block text-sm font-medium text-ivory font-display">
                Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all font-body"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="venue" className="block text-sm font-medium text-ivory font-display">
                Venue
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                placeholder="e.g. Audi Block A, Christ"
                className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all font-body"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="speaker" className="block text-sm font-medium text-ivory font-display">
                Speaker / Guest
              </label>
              <input
                type="text"
                id="speaker"
                name="speaker"
                placeholder="e.g. Dr. John Doe, AI Lead"
                className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all font-body"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="poster_url" className="block text-sm font-medium text-ivory font-display">
                Poster Image URL
              </label>
              <input
                type="url"
                id="poster_url"
                name="poster_url"
                placeholder="e.g. https://example.com/poster.jpg"
                className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all font-body"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-ivory font-display">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Briefly describe what this event is about..."
                className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all font-body resize-y"
              />
            </div>

            {/* Leader-only fields */}
            <div className="md:col-span-2 border-t border-border-gold/20 pt-6 mt-2 space-y-4">
              <h3 className="text-gold font-display font-semibold text-lg">Leader-Only Administration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="budget" className="block text-sm font-medium text-ivory font-display">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    placeholder="e.g. 5000"
                    min="0"
                    step="0.01"
                    className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all font-body"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="requirements" className="block text-sm font-medium text-ivory font-display">
                    Requirements
                  </label>
                  <input
                    type="text"
                    id="requirements"
                    name="requirements"
                    placeholder="e.g. Mic, Projector, 5 Volunteers"
                    className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all font-body"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 border-t border-border-gold/20 pt-6 mt-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_public"
                  name="is_public"
                  value="true"
                  className="w-5 h-5 rounded border-border-gold bg-bg text-gold focus:ring-gold"
                />
                <div>
                  <label htmlFor="is_public" className="block text-sm font-medium text-ivory font-display cursor-pointer">
                    Publish Event immediately
                  </label>
                  <p className="text-xs text-muted font-body">If checked, the event will appear immediately on the public calendar.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-border-gold/20 pt-6">
            <Link
              href="/admin/events"
              className="px-6 py-3 rounded-xl bg-bg border border-border-gold/50 text-ivory font-semibold hover:bg-gold/10 transition-colors text-sm"
            >
              Cancel
            </Link>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
