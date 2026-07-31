"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changePasswordAction, type ChangePasswordState } from "./actions";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const initialState: ChangePasswordState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="
        w-full rounded-xl bg-gold px-4 py-2.5
        font-body text-sm font-semibold text-bg
        hover:bg-gold-bright
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-bg-secondary
      "
    >
      {pending ? "Updating..." : "Change Password"}
    </button>
  );
}

export default function SecurityPage() {
  const [state, formAction] = useFormState(changePasswordAction, initialState);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link 
          href="/dashboard/profile"
          className="inline-flex items-center text-sm font-body text-muted hover:text-ivory transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Profile
        </Link>
        <h1 className="font-display text-2xl font-bold text-ivory">Security Settings</h1>
        <p className="font-body text-sm text-muted mt-1">
          Update your password to keep your account secure.
        </p>
      </div>

      <div className="rounded-2xl border border-border-gold/30 bg-bg-secondary/30 p-6">
        <form action={formAction} className="space-y-5">
          {/* Global error */}
          {state?.error && (
            <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400 font-body">
              {state.error}
            </div>
          )}

          {/* Success */}
          {state?.success && (
            <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-400 font-body">
              Password successfully updated!
            </div>
          )}

          {/* Old Password */}
          <div className="space-y-1.5">
            <label className="block font-body text-sm font-medium text-ivory">Old Password</label>
            <input
              name="oldPassword"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5 font-body text-sm text-ivory placeholder:text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors duration-150"
            />
            {state.fieldErrors?.oldPassword && (
              <p className="text-xs text-red-400 font-body">{state.fieldErrors.oldPassword[0]}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block font-body text-sm font-medium text-ivory">New Password</label>
            <input
              name="newPassword"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5 font-body text-sm text-ivory placeholder:text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors duration-150"
            />
            {state.fieldErrors?.newPassword && (
              <p className="text-xs text-red-400 font-body">{state.fieldErrors.newPassword[0]}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block font-body text-sm font-medium text-ivory">Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5 font-body text-sm text-ivory placeholder:text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors duration-150"
            />
            {state.fieldErrors?.confirmPassword && (
              <p className="text-xs text-red-400 font-body">{state.fieldErrors.confirmPassword[0]}</p>
            )}
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
