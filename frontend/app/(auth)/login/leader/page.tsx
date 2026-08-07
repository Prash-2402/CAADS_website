import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "../login-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Leader Sign In",
  description: "Sign in to the CAADS leader / admin panel.",
};

export default async function LeaderLoginPage() {
  // Always clear any existing session when any login page is loaded.
  // Prevents a student/volunteer cookie from silently surviving into this portal.
  const supabase = createClient();
  await supabase.auth.signOut();

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 border border-gold/50 px-3 py-1 mb-3">
          <span className="text-xs font-body font-semibold text-gold-bright uppercase tracking-wider">
            Leader Panel
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-ivory">
          Leader Sign In
        </h1>
        <p className="mt-1 font-body text-sm text-muted">
          Restricted to core team and admin accounts only.
        </p>
      </div>

      <LoginForm portal="leader" />

      <p className="text-center font-body text-xs text-muted">
        <Link
          href="/login"
          className="text-gold hover:text-gold-bright transition-colors duration-150"
        >
          Student sign in
        </Link>
        {" · "}
        <Link
          href="/login/volunteer"
          className="text-gold hover:text-gold-bright transition-colors duration-150"
        >
          Volunteer sign in
        </Link>
      </p>
    </div>
  );
}
