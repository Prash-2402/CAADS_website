"use server";

import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function checkLeader() {
  const role = await getRole();
  if (role !== "core_team" && role !== "admin") {
    throw new Error("Unauthorized: Leader access required");
  }
}

const generalAssignmentSchema = z.object({
  userId:   z.string().uuid("Invalid volunteer ID"),
  date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  role:     z.string().min(2, "Role must be at least 2 characters"),
  purpose:  z.enum(["event", "general"]),
  eventId:  z.string().uuid().optional(),
  duration: z.string().optional(),
});

/**
 * Create a date-based volunteer assignment.
 * If purpose='event', eventId must be provided.
 * If purpose='general', event_id will be null.
 */
export async function createGeneralAssignment(rawData: {
  userId: string;
  date: string;
  role: string;
  purpose: "event" | "general";
  eventId?: string;
  duration?: string;
}) {
  try {
    await checkLeader();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const validated = generalAssignmentSchema.parse(rawData);

    if (validated.purpose === "event" && !validated.eventId) {
      return { success: false, error: "An event must be selected when purpose is 'event'." };
    }

    const { error } = await supabase.from("volunteer_assignments").insert({
      user_id:         validated.userId,
      assignment_date: validated.date,
      event_id:        validated.purpose === "event" ? validated.eventId ?? null : null,
      role:            validated.role,
      purpose:         validated.purpose,
      status:          "invited",
      invited_by:      user?.id,
      expected_duration: validated.duration || "TBD",
    });

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          error: "This volunteer already has an assignment on this date.",
        };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/volunteers");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    return { success: false, error: err.message || "Failed to create assignment" };
  }
}

/**
 * Remove a volunteer assignment by its UUID primary key.
 */
export async function removeGeneralAssignment(id: string) {
  try {
    await checkLeader();
    const supabase = createClient();

    const { error } = await supabase
      .from("volunteer_assignments")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/volunteers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove assignment" };
  }
}
