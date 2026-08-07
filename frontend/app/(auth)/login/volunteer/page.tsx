import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "../login-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Volunteer Sign In",
  description: "Sign in to the CAADS volunteer portal.",
};

export default async function VolunteerLoginPage() {
  // Always clear any existing session when any login page is loaded.
  // Prevents a student/leader cookie from silently surviving into this portal.
  const supabase = createClient();
  await supabase.auth.signOut();

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-3 py-1 mb-3">
          <span className="text-xs font-body font-semibold text-gold uppercase tracking-wider">
            Volunteer Portal
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-ivory">
          Volunteer Sign In
        </h1>
        <p className="mt-1 font-body text-sm text-muted">
          For assigned volunteers, core team, and admins.
        </p>
      </div>

      <LoginForm portal="volunteer" />

      <p className="text-center font-body text-xs text-muted">
        <Link
          href="/login"
          className="text-gold hover:text-gold-bright transition-colors duration-150"
        >
          Student sign in
        </Link>
        {" · "}
        <Link
          href="/login/leader"
          className="text-gold hover:text-gold-bright transition-colors duration-150"
        >
          Leader sign in
        </Link>
      </p>
    </div>
  );
}
