"use server";

import { createClient } from "@/lib/supabase/server";
import { getRole } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";

async function checkLeader() {
  const role = await getRole();
  if (role !== "core_team" && role !== "admin") {
    throw new Error("Unauthorized: Leader access required");
  }
}

/**
 * Server action to process scanned QR content in Admin Scan Mode.
 * Handles:
 * 1. Personal badge scans: URL format '.../id/[user_id]/[key]'
 *    Marks the target user present as 'staff_scan'
 */
export async function processScan(eventId: string, qrContent: string) {
  try {
    await checkLeader();
    const supabase = createClient();
    const {
      data: { user: leader },
    } = await supabase.auth.getUser();

    // Check if the QR code is a personal badge URL
    // Format: http://<host>/id/<user_id>/<key>
    const match = qrContent.match(/\/id\/([a-f0-9-]{36})\/([a-f0-9-]{36})/i);
    if (!match) {
      return { success: false, error: "Invalid QR code format. Expected personal badge." };
    }

    const [, targetUserId, key] = match;

    // Validate the profile key
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, full_name, personal_qr_key")
      .eq("id", targetUserId)
      .single();

    if (profileErr || !profile) {
      return { success: false, error: "User profile not found." };
    }

    if (profile.personal_qr_key !== key) {
      return { success: false, error: "QR code key is expired or invalid." };
    }

    // Insert or update attendance
    const { error: attendanceErr } = await supabase
      .from("attendance")
      .upsert(
        {
          event_id: eventId,
          user_id: targetUserId,
          method: "staff_scan",
          status: "approved",
          scanned_by: leader?.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "event_id,user_id" }
      );

    if (attendanceErr) {
      return { success: false, error: attendanceErr.message };
    }

    revalidatePath(`/admin/events/${eventId}/attendance`);
    return { success: true, name: profile.full_name };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process scan" };
  }
}

/**
 * Public server action for students scanning the physical Event QR code on their own device.
 * Format: /events/[id]/claim?secret=[qr_secret]
 */
export async function claimEventAttendance(eventId: string, qrSecret: string) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Validate the event and secret
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id, qr_secret")
      .eq("id", eventId)
      .single();

    if (eventErr || !event) {
      return { success: false, error: "Event not found" };
    }

    if (event.qr_secret !== qrSecret) {
      return { success: false, error: "Invalid QR check-in secret" };
    }

    // Check if the student is registered for the event
    const { data: registration } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .single();

    if (!registration) {
      return { success: false, error: "You must register for this event before checking in." };
    }

    // Insert attendance as qr_self (auto-approved since they scanned the physical QR code)
    const { error: attendanceErr } = await supabase
      .from("attendance")
      .upsert(
        {
          event_id: eventId,
          user_id: user.id,
          method: "qr_self",
          status: "approved",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "event_id,user_id" }
      );

    if (attendanceErr) {
      return { success: false, error: attendanceErr.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to check in" };
  }
}

/**
 * Submit self-claim attendance for students who missed scanning the QR.
 * Enforced pending server-side.
 */
export async function submitSelfClaim(eventId: string) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Authentication required" };

    // Check event registration
    const { data: reg } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .single();

    if (!reg) {
      return { success: false, error: "You must register for this event to claim attendance." };
    }

    // Upsert as pending self_claim
    const { error } = await supabase
      .from("attendance")
      .upsert(
        {
          event_id: eventId,
          user_id: user.id,
          method: "self_claim",
          status: "pending",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "event_id,user_id" }
      );

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit claim" };
  }
}

/**
 * Approve a pending attendance claim (Leader only).
 */
export async function approveAttendanceClaim(eventId: string, userId: string) {
  try {
    await checkLeader();
    const supabase = createClient();

    const { error } = await supabase
      .from("attendance")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("event_id", eventId)
      .eq("user_id", userId);

    if (error) return { success: false, error: error.message };

    // Send attendance status email
    const { data: event } = await supabase
      .from("events")
      .select("title")
      .eq("id", eventId)
      .single();
    
    if (event) {
      try {
        const { getUserEmail, sendAttendanceStatusEmail } = await import("@/lib/mail");
        const email = await getUserEmail(userId);
        if (email) {
          await sendAttendanceStatusEmail(email, event.title, "approved");
        }
      } catch (err) {
        console.error("Failed to send attendance status email", err);
      }
    }

    revalidatePath(`/admin/events/${eventId}/attendance`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Reject a pending attendance claim (Leader only).
 */
export async function rejectAttendanceClaim(eventId: string, userId: string) {
  try {
    await checkLeader();
    const supabase = createClient();

    const { error } = await supabase
      .from("attendance")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("event_id", eventId)
      .eq("user_id", userId);

    if (error) return { success: false, error: error.message };

    // Send attendance status email
    const { data: event } = await supabase
      .from("events")
      .select("title")
      .eq("id", eventId)
      .single();
    
    if (event) {
      try {
        const { getUserEmail, sendAttendanceStatusEmail } = await import("@/lib/mail");
        const email = await getUserEmail(userId);
        if (email) {
          await sendAttendanceStatusEmail(email, event.title, "rejected");
        }
      } catch (err) {
        console.error("Failed to send attendance status email", err);
      }
    }

    revalidatePath(`/admin/events/${eventId}/attendance`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

