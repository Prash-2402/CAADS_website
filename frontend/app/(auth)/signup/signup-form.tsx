"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signupAction, type SignupState } from "../actions";

const initialState: SignupState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      id="signup-submit"
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
      {pending ? "Creating account…" : "Create Account"}
    </button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState(signupAction, initialState);

  if (state.success) {
    return (
      <div
        role="status"
        className="rounded-xl border border-gold/40 bg-gold/10 px-5 py-4 space-y-1"
      >
        <p className="font-body text-sm font-semibold text-gold">
          Check your email
        </p>
        <p className="font-body text-sm text-muted">
          We&apos;ve sent a confirmation link to your inbox. Click it to
          activate your account, then sign in.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Global error */}
      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400 font-body"
        >
          {state.error}
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="signup-full-name"
          className="block font-body text-sm font-medium text-ivory"
        >
          Full Name
        </label>
        <input
          id="signup-full-name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          placeholder="Alex Johnson"
          className="
            w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5
            font-body text-sm text-ivory placeholder:text-muted
            focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold
            transition-colors duration-150
          "
        />
        {state.fieldErrors?.full_name && (
          <p className="text-xs text-red-400 font-body">
            {state.fieldErrors.full_name[0]}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="signup-email"
          className="block font-body text-sm font-medium text-ivory"
        >
          University Email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@christuniversity.in"
          className="
            w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5
            font-body text-sm text-ivory placeholder:text-muted
            focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold
            transition-colors duration-150
          "
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-red-400 font-body">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="signup-password"
          className="block font-body text-sm font-medium text-ivory"
        >
          Password
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Min. 8 characters"
          className="
            w-full rounded-xl border border-border-gold bg-bg px-4 py-2.5
            font-body text-sm text-ivory placeholder:text-muted
            focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold
            transition-colors duration-150
          "
        />
        {state.fieldErrors?.password && (
          <p className="text-xs text-red-400 font-body">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
