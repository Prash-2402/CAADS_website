"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "../actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      id="login-submit"
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
      {pending ? "Signing in…" : "Sign In"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

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

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-email"
          className="block font-body text-sm font-medium text-ivory"
        >
          Email
        </label>
        <input
          id="login-email"
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
          htmlFor="login-password"
          className="block font-body text-sm font-medium text-ivory"
        >
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
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
