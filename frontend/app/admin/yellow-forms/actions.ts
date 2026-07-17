"use server";

import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const requestSchema = z.object({
  eventId: z.string().uuid(),
  periods: z.array(z.string().min(2, "Invalid period")).min(1, "Select at least one period"),
});

async function checkLeader() {
  const role = await getRole();
  if (role !== "core_team" && role !== "admin") {
    throw new Error("Unauthorized: Leader access required");
  }
}

/**
 * Submit a yellow form request.
 * Status is forced to 'pending' server-side.
 */
export async function submitYellowFormRequest(rawData: { eventId: string; periods: string[] }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Authentication required" };

    const validated = requestSchema.parse(rawData);

    const { error } = await supabase
      .from("yellow_forms")
      .upsert(
        {
          user_id: user.id,
          event_id: validated.eventId,
          periods: validated.periods,
          method: "manual",
          status: "pending",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,event_id" }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/volunteer/yellow-forms");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    return { success: false, error: err.message || "Failed to submit request" };
  }
}

/**
 * Approve a yellow form request.
 */
export async function approveYellowForm(id: string) {
  try {
    await checkLeader();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("yellow_forms")
      .update({
        status: "approved",
        approved_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/yellow-forms");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Reject a yellow form request.
 */
export async function rejectYellowForm(id: string) {
  try {
    await checkLeader();
    const supabase = createClient();

    const { error } = await supabase
      .from("yellow_forms")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/yellow-forms");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
