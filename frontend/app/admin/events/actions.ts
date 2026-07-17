"use server";

import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().optional().nullable(),
  speaker: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  poster_url: z.string().url("Must be a valid URL").or(z.string().length(0)).optional().nullable(),
  budget: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().nonnegative().nullable().optional()),
  requirements: z.string().optional().nullable(),
  is_public: z.boolean().default(false),
});

async function checkLeader() {
  const role = await getRole();
  if (role !== "core_team" && role !== "admin") {
    throw new Error("Unauthorized: Leader access required");
  }
}

export async function createEvent(prevState: any, formData: FormData) {
  try {
    await checkLeader();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const rawData = {
      title: formData.get("title"),
      date: formData.get("date"),
      time: formData.get("time") || null,
      speaker: formData.get("speaker") || null,
      description: formData.get("description") || null,
      venue: formData.get("venue") || null,
      poster_url: formData.get("poster_url") || null,
      budget: formData.get("budget") || "",
      requirements: formData.get("requirements") || null,
      is_public: formData.get("is_public") === "true",
    };

    const validated = eventSchema.parse(rawData);

    const { data: newEvent, error } = await supabase
      .from("events")
      .insert({
        title: validated.title,
        date: validated.date,
        time: validated.time || null,
        speaker: validated.speaker || null,
        description: validated.description || null,
        venue: validated.venue || null,
        poster_url: validated.poster_url || null,
        budget: validated.budget || null,
        requirements: validated.requirements || null,
        is_public: validated.is_public,
        qr_secret: crypto.randomUUID(),
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/events");
    revalidatePath("/events");
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    return { success: false, error: err.message || "Failed to create event" };
  }

  redirect("/admin/events");
}

export async function updateEvent(id: string, prevState: any, formData: FormData) {
  try {
    await checkLeader();
    const supabase = createClient();

    const rawData = {
      title: formData.get("title"),
      date: formData.get("date"),
      time: formData.get("time") || null,
      speaker: formData.get("speaker") || null,
      description: formData.get("description") || null,
      venue: formData.get("venue") || null,
      poster_url: formData.get("poster_url") || null,
      budget: formData.get("budget") || "",
      requirements: formData.get("requirements") || null,
      is_public: formData.get("is_public") === "true",
    };

    const validated = eventSchema.parse(rawData);

    const { error } = await supabase
      .from("events")
      .update({
        title: validated.title,
        date: validated.date,
        time: validated.time || null,
        speaker: validated.speaker || null,
        description: validated.description || null,
        venue: validated.venue || null,
        poster_url: validated.poster_url || null,
        budget: validated.budget || null,
        requirements: validated.requirements || null,
        is_public: validated.is_public,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/events/${id}`);
    revalidatePath(`/events/${id}`);
    revalidatePath("/admin/events");
    revalidatePath("/events");
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    return { success: false, error: err.message || "Failed to update event" };
  }

  redirect("/admin/events");
}

export async function rotateQrSecret(id: string) {
  try {
    await checkLeader();
    const supabase = createClient();

    const { error } = await supabase
      .from("events")
      .update({
        qr_secret: crypto.randomUUID(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/events/${id}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

const volunteerAssignmentSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.string().min(2, "Role must be specified"),
  expectedDuration: z.string().min(1, "Expected duration must be specified"),
});

export async function inviteVolunteer(rawData: {
  eventId: string;
  userId: string;
  role: string;
  expectedDuration: string;
}) {
  try {
    await checkLeader();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const validated = volunteerAssignmentSchema.parse(rawData);

    const { error } = await supabase
      .from("volunteer_assignments")
      .insert({
        event_id: validated.eventId,
        user_id: validated.userId,
        role: validated.role,
        expected_duration: validated.expectedDuration,
        status: "invited",
        invited_by: user?.id,
      });

    if (error) {
      if (error.code === "23505") { // Unique constraint violation
        return { success: false, error: "Volunteer is already assigned to this event." };
      }
      return { success: false, error: error.message };
    }

    // Send volunteer invitation email
    const { data: event } = await supabase
      .from("events")
      .select("title")
      .eq("id", validated.eventId)
      .single();
    
    if (event) {
      try {
        const { getUserEmail, sendVolunteerInviteEmail } = await import("@/lib/mail");
        const email = await getUserEmail(validated.userId);
        if (email) {
          await sendVolunteerInviteEmail(email, event.title, validated.role);
        }
      } catch (err) {
        console.error("Failed to send volunteer invitation email", err);
      }
    }

    revalidatePath(`/admin/events/${validated.eventId}/volunteers`);
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0].message };
    }
    return { success: false, error: err.message || "Failed to invite volunteer" };
  }
}

export async function removeVolunteerAssignment(eventId: string, userId: string) {
  try {
    await checkLeader();
    const supabase = createClient();

    const { error } = await supabase
      .from("volunteer_assignments")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/events/${eventId}/volunteers`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

