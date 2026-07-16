import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your CAADS account with your Christ University email.",
};

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ivory">
          Create Account
        </h1>
        <p className="mt-1 font-body text-sm text-muted">
          Use your Christ University email to sign up.
        </p>
      </div>

      <SignupForm />

      <p className="text-center font-body text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-gold hover:text-gold-bright transition-colors duration-150"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
