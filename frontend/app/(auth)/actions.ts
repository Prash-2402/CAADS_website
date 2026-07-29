"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isAllowedEmail } from "@/lib/supabase/auth";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Server-side validation
  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Return exact Supabase error message (e.g. "Email not confirmed", "Invalid login credentials")
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Email not confirmed. Please check your inbox for the confirmation link." };
    }
    return { error: error.message || "Invalid email or password." };
  }

  redirect("/dashboard");
}

const SignupSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100),
  reg_no: z
    .string()
    .min(5, "Register Number / USN must be at least 5 characters (e.g. 2402001).")
    .max(20, "Register Number / USN is too long.")
    .regex(/^[A-Za-z0-9]+$/, "Register Number / USN can only contain letters and numbers."),
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72),
});

export type SignupState = {
  error?: string;
  success?: boolean;
  fieldErrors?: {
    full_name?: string[];
    reg_no?: string[];
    email?: string[];
    password?: string[];
  };
};

export async function signupAction(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const raw = {
    full_name: formData.get("full_name"),
    reg_no: formData.get("reg_no"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Server-side validation
  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { full_name, reg_no, email, password } = parsed.data;

  // Domain restriction — enforced server-side, never trust client
  if (!isAllowedEmail(email)) {
    return {
      fieldErrors: {
        email: ["Only Christ University email addresses are allowed (e.g. @christuniversity.in or @science.christuniversity.in)."],
      },
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        reg_no: reg_no.trim().toUpperCase(),
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with this email already exists." };
    }
    return { error: error.message || "Something went wrong. Please try again." };
  }

  // Return success — user must verify email before logging in
  return { success: true };
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
