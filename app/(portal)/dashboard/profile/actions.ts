"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";

const ProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
});

export type ProfileState = {
  error?: string;
  success?: boolean;
  fieldErrors?: {
    fullName?: string[];
  };
};

export async function updateProfileAction(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const profile = await getProfile();
  if (!profile) return { error: "Unauthorized" };

  const raw = {
    fullName: formData.get("fullName"),
  };

  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("id", profile.id);

  if (error) {
    return { error: "Failed to update profile." };
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function generateQrKeyAction() {
  const profile = await getProfile();
  if (!profile || !profile.is_staff) return { error: "Unauthorized" };

  const supabase = createClient();
  
  // Use crypto.randomUUID() for secure token generation
  const newKey = crypto.randomUUID();
  
  const { error } = await supabase
    .from("profiles")
    .update({ personal_qr_key: newKey })
    .eq("id", profile.id);

  if (error) {
    return { error: "Failed to generate QR key." };
  }

  revalidatePath("/dashboard/profile");
  return { success: true, key: newKey };
}
