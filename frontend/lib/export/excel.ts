import ExcelJS from "exceljs";
import { createClient as createServiceClient } from "@supabase/supabase-js";

function getServiceRoleSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createServiceClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Builds an Excel workbook for an event with Attendance as the FIRST (primary) sheet.
 * Merges registrations and attendance logs so no attendee is missed.
 */
export async function buildEventMultiSheetExport(eventId: string): Promise<Buffer> {
  const supabase = getServiceRoleSupabase();

  const { data: event } = await supabase
    .from("events")
    .select("title, date")
    .eq("id", eventId)
    .single();

  const eventTitle = event?.title || "Event";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CAADS Platform";
  workbook.created = new Date();

  // Fetch registrations
  const { data: regRows } = await supabase
    .from("event_registrations")
    .select("user_id, registered_at")
    .eq("event_id", eventId);

  // Fetch attendance records
  const { data: attRows } = await supabase
    .from("attendance")
    .select("user_id, method, status, check_in_time, periods_present, updated_at, created_at")
    .eq("event_id", eventId);

  // Collect all unique user IDs
  const allUserIds = Array.from(
    new Set([
      ...(regRows ?? []).map((r) => r.user_id),
      ...(attRows ?? []).map((a) => a.user_id),
    ])
  );

  // Fetch profiles for all relevant users
  const { data: profiles } = allUserIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, reg_no, role")
        .in("id", allUserIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const attMap = new Map((attRows ?? []).map((a) => [a.user_id, a]));
  const regMap = new Map((regRows ?? []).map((r) => [r.user_id, r]));

  // ── 1. Sheet 1: Attendance (PRIMARY SHEET) ──────────────────────────────
  const attSheet = workbook.addWorksheet("Attendance Checklist");
  attSheet.columns = [
    { header: "Full Name", key: "name", width: 30 },
    { header: "Registration No", key: "regNo", width: 20 },
    { header: "Role", key: "role", width: 15 },
    { header: "Attendance Status", key: "status", width: 20 },
    { header: "Check-in Method", key: "method", width: 20 },
    { header: "Scan-in Time (IST)", key: "checkInTime", width: 25 },
    { header: "Periods Present", key: "periods", width: 25 },
  ];

  allUserIds.forEach((userId) => {
    const prof = profileMap.get(userId);
    const att  = attMap.get(userId);
    const reg  = regMap.get(userId);

    const periods = Array.isArray(att?.periods_present) && att.periods_present.length > 0
      ? att.periods_present.join(", ")
      : "None";

    const checkInTimeFormatted = att?.check_in_time
      ? new Date(att.check_in_time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : "Not Checked In";

    attSheet.addRow({
      name: prof?.full_name || "N/A",
      regNo: prof?.reg_no || "N/A",
      role: prof?.role ? prof.role.replace("_", " ") : "Student",
      status: att ? att.status.toUpperCase() : (reg ? "NOT CHECKED IN" : "ABSENT"),
      method: att ? (att.method === "qr_self" ? "Self QR Scan" : att.method === "staff_scan" ? "Staff Scan" : att.method === "manual" ? "Manual Entry" : "Self Claim") : "N/A",
      checkInTime: checkInTimeFormatted,
      periods: periods,
    });
  });

  attSheet.getRow(1).font = { bold: true };
  attSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8B93E" }, // Gold header
  };

  // ── 2. Sheet 2: Yellow Forms ─────────────────────────────────────────────
  const yfSheet = workbook.addWorksheet("Yellow Forms");
  yfSheet.columns = [
    { header: "Full Name", key: "name", width: 30 },
    { header: "Registration No", key: "regNo", width: 20 },
    { header: "Periods Missed / Present", key: "periods", width: 25 },
    { header: "Status", key: "status", width: 15 },
    { header: "Requested At", key: "createdAt", width: 25 },
  ];

  const { data: yfRows } = await supabase
    .from("yellow_forms")
    .select("user_id, periods, status, created_at")
    .eq("event_id", eventId);

  if (yfRows && yfRows.length > 0) {
    yfRows.forEach((yf) => {
      const prof = profileMap.get(yf.user_id);
      yfSheet.addRow({
        name: prof?.full_name || "N/A",
        regNo: prof?.reg_no || "N/A",
        periods: Array.isArray(yf.periods) ? yf.periods.join(", ") : "N/A",
        status: yf.status,
        createdAt: yf.created_at ? new Date(yf.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A",
      });
    });
  }
  yfSheet.getRow(1).font = { bold: true };

  // ── 3. Sheet 3: Assigned Volunteers ──────────────────────────────────────
  const volSheet = workbook.addWorksheet("Volunteers");
  volSheet.columns = [
    { header: "Full Name", key: "name", width: 30 },
    { header: "Registration No", key: "regNo", width: 20 },
    { header: "Duty / Role", key: "role", width: 20 },
    { header: "Purpose", key: "purpose", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Expected Duration", key: "duration", width: 20 },
    { header: "Check-in Time", key: "checkInTime", width: 25 },
  ];

  const { data: volRows } = await supabase
    .from("volunteer_assignments")
    .select("user_id, role, purpose, status, expected_duration, check_in_time")
    .eq("event_id", eventId);

  if (volRows && volRows.length > 0) {
    const volUserIds = volRows.map((v) => v.user_id);
    const { data: volProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, reg_no")
      .in("id", volUserIds);

    const volProfileMap = new Map((volProfiles ?? []).map((p) => [p.id, p]));

    volRows.forEach((v) => {
      const prof = volProfileMap.get(v.user_id);
      volSheet.addRow({
        name: prof?.full_name || "N/A",
        regNo: prof?.reg_no || "N/A",
        role: v.role || "N/A",
        purpose: v.purpose || "event",
        status: v.status || "invited",
        duration: v.expected_duration || "N/A",
        checkInTime: v.check_in_time ? new Date(v.check_in_time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A",
      });
    });
  }
  volSheet.getRow(1).font = { bold: true };

  // Write workbook as Buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Builds a single-sheet Excel workbook of all Yellow Form requests.
 */
export async function buildYellowFormsExport(): Promise<Buffer> {
  const supabase = getServiceRoleSupabase();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CAADS Platform";
  
  const sheet = workbook.addWorksheet("Yellow Forms");
  sheet.columns = [
    { header: "Student Name", key: "name", width: 30 },
    { header: "Registration No", key: "regNo", width: 20 },
    { header: "Event Title", key: "eventTitle", width: 30 },
    { header: "Periods Missed", key: "periods", width: 25 },
    { header: "Status", key: "status", width: 15 },
    { header: "Requested At", key: "createdAt", width: 25 },
  ];

  const { data: allYfRows } = await supabase
    .from("yellow_forms")
    .select("user_id, event_id, periods, status, created_at")
    .order("created_at", { ascending: false });

  if (allYfRows && allYfRows.length > 0) {
    const allUserIds = Array.from(new Set(allYfRows.map((yf) => yf.user_id)));
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, reg_no")
      .in("id", allUserIds);
    const allProfileMap = new Map((allProfiles ?? []).map((p) => [p.id, p]));

    const allEventIds = Array.from(new Set(allYfRows.map((yf) => yf.event_id).filter(Boolean)));
    const { data: allEvents } = allEventIds.length > 0
      ? await supabase.from("events").select("id, title").in("id", allEventIds)
      : { data: [] };
    const allEventMap = new Map((allEvents ?? []).map((e) => [e.id, e]));

    allYfRows.forEach((yf) => {
      const prof = allProfileMap.get(yf.user_id);
      const ev = yf.event_id ? allEventMap.get(yf.event_id) : null;
      sheet.addRow({
        name: prof?.full_name || "N/A",
        regNo: prof?.reg_no || "N/A",
        eventTitle: ev?.title || "General / N/A",
        periods: Array.isArray(yf.periods) ? yf.periods.join(", ") : "N/A",
        status: yf.status,
        createdAt: yf.created_at ? new Date(yf.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A",
      });
    });
  }

  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Builds a single-sheet Excel workbook of meeting attendance records.
 */
export async function buildMeetingAttendanceExport(meetingId: string): Promise<Buffer> {
  const supabase = getServiceRoleSupabase();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CAADS Platform";

  const sheet = workbook.addWorksheet("Meeting Attendance");
  sheet.columns = [
    { header: "Full Name", key: "name", width: 30 },
    { header: "Registration No", key: "regNo", width: 20 },
    { header: "Check-in Method", key: "method", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Recorded At", key: "createdAt", width: 25 },
  ];

  const { data: meetingRecords, error: meetingAttErr } = await supabase
    .from("meeting_attendance")
    .select("user_id, method, status, created_at")
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: true });

  if (meetingAttErr) {
    console.error("[Excel Export] Meeting attendance fetch error:", meetingAttErr.message);
  }

  if (meetingRecords && meetingRecords.length > 0) {
    const meetingUserIds = meetingRecords.map((r) => r.user_id);
    const { data: meetingProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, reg_no")
      .in("id", meetingUserIds);
    const meetingProfileMap = new Map((meetingProfiles ?? []).map((p) => [p.id, p]));

    meetingRecords.forEach((r) => {
      const prof = meetingProfileMap.get(r.user_id);
      sheet.addRow({
        name: prof?.full_name || "N/A",
        regNo: prof?.reg_no || "N/A",
        method: r.method,
        status: r.status,
        createdAt: r.created_at ? new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A",
      });
    });
  }

  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
