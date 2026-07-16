import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to the CAADS platform.",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ivory">
          Sign In
        </h1>
        <p className="mt-1 font-body text-sm text-muted">
          Use your Christ University email to continue.
        </p>
      </div>

      <LoginForm />

      <p className="text-center font-body text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-gold hover:text-gold-bright transition-colors duration-150"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
