"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isAllowedEmail } from "@/lib/supabase/auth";



const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  usn: z.string().min(5, "Register Number / USN is required."),
  password: z.string().min(1, "Password is required."),
});

export type LoginState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    usn?: string[];
    password?: string[];
  };
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    const raw = {
      email: formData.get("email"),
      usn: formData.get("usn"),
      password: formData.get("password"),
    };

    // Server-side validation
    const parsed = LoginSchema.safeParse(raw);
    if (!parsed.success) {
      return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const { email, usn, password } = parsed.data;

    // Enforce Christ Email domain
    if (!isAllowedEmail(email)) {
      return {
        fieldErrors: {
          email: ["Only Christ University email addresses are allowed."],
        },
      };
    }

    const supabase = createClient();
    // Ensure any previous session cookie is cleared before signing in
    await supabase.auth.signOut();
    let { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });



    if (error) {
      const rawMsg = typeof error === "string" ? error : error?.message || "Invalid email or password.";
      if (rawMsg.toLowerCase().includes("email not confirmed")) {
        return { error: "Email not confirmed. Please check your inbox for the confirmation link." };
      }
      return { error: String(rawMsg) };
    }

    // Verify USN matches the registered account for extra security
    if (authData?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("reg_no")
        .eq("id", authData.user.id)
        .single();
      
      if (profile && profile.reg_no !== usn) {
        await supabase.auth.signOut();
        return { error: "The provided USN does not match the registered account for this email." };
      }
    }

  } catch (err: any) {
    // Re-throw Next.js redirect exception so navigation occurs seamlessly
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Auth login exception:", err);
    return { error: err?.message || String(err) || "An error occurred while communicating with the authentication server." };
  }

  revalidatePath("/", "layout");
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
  try {
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
  } catch (err: any) {
    console.error("Auth signup exception:", err);
    return { error: err?.message || String(err) || "An error occurred during account creation." };
  }
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
