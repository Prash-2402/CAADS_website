"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateProfileAction, type ProfileState } from "../actions";
import { CheckCircle2 } from "lucide-react";

const initialState: ProfileState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="
        rounded-xl bg-gold px-6 py-2.5
        font-body text-sm font-semibold text-bg
        hover:bg-gold-bright
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
      "
    >
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}

export function ProfileForm({ initialName }: { initialName: string }) {
  const [state, formAction] = useFormState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      {state.success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          Profile updated successfully!
        </div>
      )}
      {state.error && (
        <div className="bg-red-950/40 border border-red-800 text-red-400 p-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="block font-body text-sm font-medium text-ivory mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          defaultValue={initialName}
          required
          className="w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5 font-body text-sm text-ivory placeholder:text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        />
        {state.fieldErrors?.fullName && <p className="text-xs text-red-400 mt-1">{state.fieldErrors.fullName[0]}</p>}
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
