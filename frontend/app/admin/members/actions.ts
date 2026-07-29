"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/supabase/auth";

const memberUpdateSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["student", "volunteer", "core_team", "admin"]),
  isStaff: z.boolean(),
});

async function checkAdmin() {
  const role = await getRole();
  if (role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
}

export async function updateMemberAccessAction(formData: FormData) {
  await checkAdmin();

  const parsed = memberUpdateSchema.parse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    isStaff: formData.get("isStaff") === "on",
  });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  if (user.id === parsed.userId && parsed.role !== "admin") {
    throw new Error("You cannot remove your own admin access.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: parsed.role,
      is_staff: parsed.isStaff,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/members");
}
