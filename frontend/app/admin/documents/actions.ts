"use server";

import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const documentSchema = z.object({
  driveLink: z.string().url("Must be a valid Google Drive URL"),
  eventId: z.string().uuid().nullable().optional(),
  meetingId: z.string().uuid().nullable().optional(),
}).refine(data => data.eventId || data.meetingId, {
  message: "Document must be linked to either an event or a meeting.",
  path: ["eventId"],
});

async function checkLeader() {
  const role = await getRole();
  if (role !== "core_team" && role !== "admin") {
    throw new Error("Unauthorized: Leader access required");
  }
}

export async function addDocument(prevState: any, formData: FormData) {
  try {
    await checkLeader();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const rawData = {
      driveLink: formData.get("driveLink"),
      eventId: formData.get("eventId") || null,
      meetingId: formData.get("meetingId") || null,
    };

    const validated = documentSchema.parse(rawData);

    const { error } = await supabase.from("documents").insert({
      drive_link: validated.driveLink,
      event_id: validated.eventId || null,
      meeting_id: validated.meetingId || null,
      uploaded_by: user?.id,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/documents");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    return { success: false, error: err.message || "Failed to add document" };
  }
}

export async function deleteDocument(id: string) {
  try {
    await checkLeader();
    const supabase = createClient();

    const { error } = await supabase.from("documents").delete().eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/documents");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
