"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "../actions";

const initialState: LoginState = {};

type SampleAccount = {
  role: string;
  badgeStyle: string;
  name: string;
  email: string;
  password: string;
  scope: string;
};

const SAMPLE_LOGINS: SampleAccount[] = [
  {
    role: "Admin",
    badgeStyle: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    name: "Admin User",
    email: "admin@christuniversity.in",
    password: "Password123!",
    scope: "Members directory, Role management, Site settings & audit",
  },
  {
    role: "Core Team",
    badgeStyle: "border-gold/40 bg-gold/10 text-gold-bright",
    name: "Core Team Lead",
    email: "coreteam@christuniversity.in",
    password: "Password123!",
    scope: "Events, Volunteer selection, Meetings & AI assistant",
  },
  {
    role: "Volunteer Lead",
    badgeStyle: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    name: "Volunteer Lead",
    email: "volunteer.lead@christuniversity.in",
    password: "Password123!",
    scope: "Volunteer portal, Duty status & Yellow form requests",
  },
  {
    role: "Volunteer",
    badgeStyle: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    name: "Event Volunteer",
    email: "volunteer@christuniversity.in",
    password: "Password123!",
    scope: "Duty accept/decline & personal staff QR badge",
  },
  {
    role: "Student (Main)",
    badgeStyle: "border-border-gold/60 bg-bg-secondary text-ivory",
    name: "Regular Student",
    email: "student@christuniversity.in",
    password: "Password123!",
    scope: "Event registration & attendance self-claim",
  },
  {
    role: "Student (Alt)",
    badgeStyle: "border-border-gold/40 bg-bg-secondary text-muted",
    name: "Participant Student",
    email: "student2@christuniversity.in",
    password: "Password123!",
    scope: "Multi-user registration & registration limit testing",
  },
];

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const handleSelectAccount = (acc: SampleAccount) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedAccount(acc.email);
  };

  return (
    <div className="space-y-6">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

      {/* Sample Logins Quick Fill */}
      <div className="pt-4 border-t border-border-gold/40 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-gold">
            🧪 Sample Logins (1-Click Test)
          </h2>
          <span className="font-mono text-[10px] text-muted">
            All passwords: <code className="text-ivory">Password123!</code>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {SAMPLE_LOGINS.map((acc) => {
            const isSelected = selectedAccount === acc.email;
            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelectAccount(acc)}
                className={`
                  w-full text-left rounded-xl p-3 border transition-all duration-150
                  flex flex-col space-y-1 group
                  ${
                    isSelected
                      ? "bg-gold/15 border-gold shadow-sm shadow-gold/20"
                      : "bg-bg-secondary/60 border-border-gold/40 hover:border-gold/60 hover:bg-bg-secondary"
                  }
                `}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <span className="font-body text-xs font-semibold text-ivory group-hover:text-gold-bright transition-colors">
                      {acc.name}
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      ({acc.email})
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${acc.badgeStyle}`}
                  >
                    {acc.role}
                  </span>
                </div>
                <p className="font-body text-[11px] text-muted leading-tight">
                  {acc.scope}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

