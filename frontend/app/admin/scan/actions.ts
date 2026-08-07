"use server";

import { createClient } from "@/lib/supabase/server";
import { getRole, getProfile } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { enforceRateLimit } from "@/lib/rate-limit";
import { computePeriodsFromISO, buildISTTimestamp } from "@/lib/periods";

async function checkLeader() {
  const role = await getRole();
  if (role !== "core_team" && role !== "admin") {
    throw new Error("Unauthorized: Leader access required");
  }
}

async function checkStaffOrLeader() {
  const profile = await getProfile();
  if (!profile) {
    throw new Error("Unauthorized: Authentication required");
  }
  const isAuthorized =
    profile.is_staff || ["volunteer", "core_team", "admin"].includes(profile.role);
  if (!isAuthorized) {
    throw new Error("Unauthorized: Staff or Leader access required");
  }
}

/**
 * Server action to process scanned QR content in Admin Scan Mode.
 * Handles personal badge scans — marks the target user present as 'staff_scan'
 * and records the exact check-in time + derived period.
 */
export async function processScan(eventId: string, qrContent: string) {
  try {
    await checkStaffOrLeader();
    const supabase = createClient();
    const {
      data: { user: leader },
    } = await supabase.auth.getUser();

    // Check if the QR code is a personal badge URL
    const match = qrContent.match(/\/id\/([a-f0-9-]{36})\/([a-f0-9-]{36})/i);
    if (!match) {
      return { success: false, error: "Invalid QR code format. Expected personal badge." };
    }

    const [, targetUserId, key] = match;

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

    const now = new Date();
    const checkInISO = now.toISOString();
    const periodsPresent = computePeriodsFromISO(checkInISO);

    const { error: attendanceErr } = await supabase
      .from("attendance")
      .upsert(
        {
          event_id: eventId,
          user_id: targetUserId,
          method: "staff_scan",
          status: "approved",
          scanned_by: leader?.id,
          check_in_time: checkInISO,
          periods_present: periodsPresent,
          updated_at: checkInISO,
        },
        { onConflict: "event_id,user_id" },
      );

    if (attendanceErr) {
      return { success: false, error: attendanceErr.message };
    }

    // Auto-generate a yellow form if periods were detected
    if (periodsPresent.length > 0) {
      await supabase
        .from("yellow_forms")
        .upsert(
          {
            user_id: targetUserId,
            event_id: eventId,
            periods: periodsPresent,
            method: "staff_scan",
            status: "pending",
          },
          { onConflict: "user_id,event_id" },
        );
    }

    revalidatePath(`/admin/events/${eventId}/attendance`);
    return { success: true, name: profile.full_name, periods: periodsPresent };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process scan" };
  }
}

/**
 * Public server action for students scanning the physical Event QR code.
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

    const { data: registration } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .single();

    if (!registration) {
      return {
        success: false,
        error: "You must register for this event before checking in.",
      };
    }

    const now = new Date();
    const checkInISO = now.toISOString();
    const periodsPresent = computePeriodsFromISO(checkInISO);

    const { error: attendanceErr } = await supabase
      .from("attendance")
      .upsert(
        {
          event_id: eventId,
          user_id: user.id,
          method: "qr_self",
          status: "approved",
          check_in_time: checkInISO,
          periods_present: periodsPresent,
          updated_at: checkInISO,
        },
        { onConflict: "event_id,user_id" },
      );

    if (attendanceErr) {
      return { success: false, error: attendanceErr.message };
    }

    // Auto-generate yellow form
    if (periodsPresent.length > 0) {
      await supabase
        .from("yellow_forms")
        .upsert(
          {
            user_id: user.id,
            event_id: eventId,
            periods: periodsPresent,
            method: "qr_self",
            status: "pending",
          },
          { onConflict: "user_id,event_id" },
        );
    }

    revalidatePath("/dashboard");
    return { success: true, periods: periodsPresent };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to check in" };
  }
}

/**
 * Submit self-claim attendance for students who missed scanning the QR.
 * Always set to pending server-side.
 */
export async function submitSelfClaim(eventId: string) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Authentication required" };

    const rateCheck = await enforceRateLimit({
      action: "attendance_self_claim",
      userId: user.id,
      maxAttempts: 3,
      windowSeconds: 300,
    });
    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.message };
    }

    const { data: reg } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .single();

    if (!reg) {
      return {
        success: false,
        error: "You must register for this event to claim attendance.",
      };
    }

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
        { onConflict: "event_id,user_id" },
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
 * Also updates periods_present if check_in_time exists and auto-generates a yellow form.
 */
export async function approveAttendanceClaim(eventId: string, userId: string) {
  try {
    await checkLeader();
    const supabase = createClient();

    // First fetch the existing record to get check_in_time
    const { data: existing } = await supabase
      .from("attendance")
      .select("check_in_time, periods_present")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .single();

    // Compute periods if check_in_time exists but periods aren't set yet
    let periodsPresent: string[] = existing?.periods_present ?? [];
    if (existing?.check_in_time && periodsPresent.length === 0) {
      periodsPresent = computePeriodsFromISO(existing.check_in_time);
    }

    const { error } = await supabase
      .from("attendance")
      .update({
        status: "approved",
        periods_present: periodsPresent,
        updated_at: new Date().toISOString(),
      })
      .eq("event_id", eventId)
      .eq("user_id", userId);

    if (error) return { success: false, error: error.message };

    // Auto-generate yellow form based on periods
    if (periodsPresent.length > 0) {
      await supabase
        .from("yellow_forms")
        .upsert(
          {
            user_id: userId,
            event_id: eventId,
            periods: periodsPresent,
            method: "self_claim",
            status: "pending",
          },
          { onConflict: "user_id,event_id" },
        );
    }

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

/**
 * Manually add or overwrite an attendance record (Leader only).
 * Sets method='manual', status='approved', records check_in_time and derives periods.
 *
 * @param eventId   The event UUID
 * @param userId    The user UUID
 * @param timeStr   Optional "HH:mm" in IST. If null, uses current time.
 */
export async function manualAddAttendance(
  eventId: string,
  userId: string,
  timeStr: string | null,
) {
  try {
    await checkLeader();
    const supabase = createClient();

    // Build the IST timestamp
    const todayIST = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date()); // "YYYY-MM-DD"

    const checkInISO = timeStr
      ? buildISTTimestamp(todayIST, timeStr)
      : new Date().toISOString();

    const periodsPresent = computePeriodsFromISO(checkInISO);

    const { error } = await supabase
      .from("attendance")
      .upsert(
        {
          event_id: eventId,
          user_id: userId,
          method: "manual" as any,
          status: "approved",
          check_in_time: checkInISO,
          periods_present: periodsPresent,
          updated_at: checkInISO,
        },
        { onConflict: "event_id,user_id" },
      );

    if (error) return { success: false, error: error.message };

    // Auto-generate yellow form
    if (periodsPresent.length > 0) {
      await supabase
        .from("yellow_forms")
        .upsert(
          {
            user_id: userId,
            event_id: eventId,
            periods: periodsPresent,
            method: "manual" as any,
            status: "pending",
          },
          { onConflict: "user_id,event_id" },
        );
    }

    revalidatePath(`/admin/events/${eventId}/attendance`);
    return { success: true, periods: periodsPresent };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to add attendance" };
  }
}

/**
 * Remove an attendance record entirely (Leader only).
 */
export async function removeAttendance(eventId: string, userId: string) {
  try {
    await checkLeader();
    const supabase = createClient();

    // 1. Try deleting attendance record via standard client
    let { error } = await supabase
      .from("attendance")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);

    // If RLS blocked standard client delete, fallback to service role
    if (error && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createServiceClient } = await import("@supabase/supabase-js");
      const adminSupabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const res = await adminSupabase
        .from("attendance")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);
      error = res.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }

    // 2. Also cleanup any associated yellow forms for this event & user
    const { error: yfError } = await supabase
      .from("yellow_forms")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);

    if (yfError && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createServiceClient } = await import("@supabase/supabase-js");
      const adminSupabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await adminSupabase
        .from("yellow_forms")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);
    }

    revalidatePath(`/admin/events/${eventId}/attendance`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove attendance" };
  }
}

