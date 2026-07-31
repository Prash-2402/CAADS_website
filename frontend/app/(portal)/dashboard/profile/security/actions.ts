"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmPassword: z.string().min(1, "Confirm password is required.")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});

export type ChangePasswordState = {
  error?: string;
  success?: boolean;
  fieldErrors?: {
    oldPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
  };
};

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  try {
    const raw = {
      oldPassword: formData.get("oldPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const parsed = ChangePasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const { oldPassword, newPassword } = parsed.data;

    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return { error: "You must be logged in to change your password." };
    }

    // Verify old password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (signInError) {
      return { error: "Incorrect old password." };
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { error: updateError.message || "Failed to update password." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Change password exception:", err);
    return { error: err?.message || String(err) || "An unexpected error occurred." };
  }
}
