"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitReviewAction, type ReviewState } from "../actions";
import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const initialState: ReviewState = {};

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
      {pending ? "Submitting..." : "Submit Review"}
    </button>
  );
}

export function ReviewForm() {
  const [state, formAction] = useFormState(submitReviewAction, initialState);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [selectedStar, setSelectedStar] = useState<number>(0);

  if (state.success) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold mb-4">
          <Star className="text-gold fill-gold" size={32} />
        </div>
        <h3 className="font-display text-2xl font-bold text-ivory">Thank you!</h3>
        <p className="font-body text-muted">
          Your review has been successfully submitted. We appreciate your feedback!
        </p>
        <div className="pt-6 border-t border-border-gold/30">
          <Link href="/dashboard" className="text-gold hover:text-gold-bright font-semibold">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="bg-red-950/40 border border-red-800 text-red-400 p-4 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label className="block font-body text-sm font-medium text-ivory mb-2">
          Rating (Optional)
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setSelectedStar(star)}
            >
              <Star 
                size={32} 
                className={cn(
                  "transition-colors",
                  (hoveredStar || selectedStar) >= star 
                    ? "text-gold fill-gold" 
                    : "text-muted"
                )} 
              />
            </button>
          ))}
        </div>
        {/* Hidden input to submit the rating value */}
        <input type="hidden" name="rating" value={selectedStar || ""} />
        {state.fieldErrors?.rating && <p className="text-xs text-red-400 mt-2">{state.fieldErrors.rating[0]}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block font-body text-sm font-medium text-ivory mb-2">
          Your Feedback
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Tell us what you liked or how we can improve..."
          className="w-full rounded-xl border border-border-gold bg-bg px-4 py-3 font-body text-sm text-ivory placeholder:text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none"
        ></textarea>
        {state.fieldErrors?.message && <p className="text-xs text-red-400 mt-2">{state.fieldErrors.message[0]}</p>}
      </div>

      <div className="pt-4 border-t border-border-gold/30">
        <SubmitButton />
      </div>
    </form>
  );
}
