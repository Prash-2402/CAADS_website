import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";

// We use service role to fetch all registration & attendance data for export to bypass RLS limits on leaders
import { createClient as createServiceClient } from "@supabase/supabase-js";

function getServiceRoleSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createServiceClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Builds a multi-sheet Excel workbook for a specific event containing:
 * - Registrations (Sheet 1)
 * - Attendance logs (Sheet 2)
 * - Yellow forms (Sheet 3)
 */
export async function buildEventMultiSheetExport(eventId: string): Promise<Buffer> {
  const supabase = getServiceRoleSupabase();

  // Verify service role client works
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("title")
    .eq("id", eventId)
    .single();

  if (eventError) {
    console.error("[Excel] Failed to fetch event:", eventError.message);
  }
  const eventTitle = event?.title || "Event";
  console.log("[Excel] Building export for event:", eventTitle, "id:", eventId);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CAADS Platform";
  workbook.created = new Date();

  // ── 1. Sheet: Registrations ──────────────────────────────────────────────
  const regSheet = workbook.addWorksheet("Registrations");
  regSheet.columns = [
    { header: "Full Name", key: "name", width: 30 },
    { header: "Registration No", key: "regNo", width: 20 },
    { header: "Role", key: "role", width: 15 },
    { header: "Registered At", key: "registeredAt", width: 25 },
  ];

  const { data: regRows, error: regError } = await supabase
    .from("event_registrations")
    .select("user_id, registered_at")
    .eq("event_id", eventId);

  console.log("[Excel] Registrations fetched:", regRows?.length ?? 0, "error:", regError?.message);

  if (regRows && regRows.length > 0) {
    const regUserIds = regRows.map((r) => r.user_id);
    const { data: regProfiles, error: regProfileErr } = await supabase
      .from("profiles")
      .select("id, full_name, reg_no, role")
      .in("id", regUserIds);

    console.log("[Excel] Reg profiles fetched:", regProfiles?.length ?? 0, "error:", regProfileErr?.message);
    const regProfileMap = new Map(regProfiles?.map((p) => [p.id, p]) ?? []);

    regRows.forEach((r) => {
      const prof = regProfileMap.get(r.user_id);
      regSheet.addRow({
        name: prof?.full_name || "N/A",
        regNo: prof?.reg_no || "N/A",
        role: prof?.role || "N/A",
        registeredAt: r.registered_at ? new Date(r.registered_at).toLocaleString() : "N/A",
      });
    });
  }

  regSheet.getRow(1).font = { bold: true };

  // ── 2. Sheet: Attendance ─────────────────────────────────────────────────
  const attSheet = workbook.addWorksheet("Attendance");
  attSheet.columns = [
    { header: "Full Name", key: "name", width: 30 },
    { header: "Registration No", key: "regNo", width: 20 },
    { header: "Check-in Method", key: "method", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Checked At", key: "checkedAt", width: 25 },
  ];

  const { data: attendanceRows, error: attError } = await supabase
    .from("attendance")
    .select("user_id, method, status, updated_at, created_at")
    .eq("event_id", eventId);

  console.log("[Excel] Attendance fetched:", attendanceRows?.length ?? 0, "error:", attError?.message);

  if (attendanceRows && attendanceRows.length > 0) {
    const attUserIds = attendanceRows.map((a) => a.user_id);
    const { data: attProfiles, error: attProfileErr } = await supabase
      .from("profiles")
      .select("id, full_name, reg_no")
      .in("id", attUserIds);

    console.log("[Excel] Att profiles fetched:", attProfiles?.length ?? 0, "error:", attProfileErr?.message);
    const attProfileMap = new Map(attProfiles?.map((p) => [p.id, p]) ?? []);

    attendanceRows.forEach((a) => {
      const prof = attProfileMap.get(a.user_id);
      const timestamp = a.updated_at || a.created_at;
      attSheet.addRow({
        name: prof?.full_name || "N/A",
        regNo: prof?.reg_no || "N/A",
        method: a.method,
        status: a.status,
        checkedAt: timestamp ? new Date(timestamp).toLocaleString() : "N/A",
      });
    });
  }

  attSheet.getRow(1).font = { bold: true };

  // ── 3. Sheet: Yellow Forms ───────────────────────────────────────────────
  const yfSheet = workbook.addWorksheet("Yellow Forms");
  yfSheet.columns = [
    { header: "Full Name", key: "name", width: 30 },
    { header: "Registration No", key: "regNo", width: 20 },
    { header: "Periods Missed", key: "periods", width: 25 },
    { header: "Status", key: "status", width: 15 },
    { header: "Requested At", key: "createdAt", width: 25 },
  ];

  const { data: yfRows, error: yfError } = await supabase
    .from("yellow_forms")
    .select("user_id, periods, status, created_at")
    .eq("event_id", eventId);

  console.log("[Excel] Yellow forms fetched:", yfRows?.length ?? 0, "error:", yfError?.message);

  if (yfRows && yfRows.length > 0) {
    const yfUserIds = yfRows.map((yf) => yf.user_id);
    const { data: yfProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, reg_no")
      .in("id", yfUserIds);

    const yfProfileMap = new Map(yfProfiles?.map((p) => [p.id, p]) ?? []);

    yfRows.forEach((yf) => {
      const prof = yfProfileMap.get(yf.user_id);
      yfSheet.addRow({
        name: prof?.full_name || "N/A",
        regNo: prof?.reg_no || "N/A",
        periods: yf.periods.join(", "),
        status: yf.status,
        createdAt: yf.created_at ? new Date(yf.created_at).toLocaleString() : "N/A",
      });
    });
  }

  yfSheet.getRow(1).font = { bold: true };

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
    // Fetch all related profiles
    const allUserIds = Array.from(new Set(allYfRows.map((yf) => yf.user_id)));
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, reg_no")
      .in("id", allUserIds);
    const allProfileMap = new Map(allProfiles?.map((p) => [p.id, p]) ?? []);

    // Fetch all related events
    const allEventIds = Array.from(new Set(allYfRows.map((yf) => yf.event_id)));
    const { data: allEvents } = await supabase
      .from("events")
      .select("id, title")
      .in("id", allEventIds);
    const allEventMap = new Map(allEvents?.map((e) => [e.id, e]) ?? []);

    allYfRows.forEach((yf) => {
      const prof = allProfileMap.get(yf.user_id);
      const ev = allEventMap.get(yf.event_id);
      sheet.addRow({
        name: prof?.full_name || "N/A",
        regNo: prof?.reg_no || "N/A",
        eventTitle: ev?.title || "N/A",
        periods: yf.periods.join(", "),
        status: yf.status,
        createdAt: yf.created_at ? new Date(yf.created_at).toLocaleString() : "N/A",
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

  // Fetch meeting title for context
  const { data: meeting } = await supabase
    .from("meetings")
    .select("title")
    .eq("id", meetingId)
    .single();
  const meetingTitle = meeting?.title || "Meeting";

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
    const meetingProfileMap = new Map(meetingProfiles?.map((p) => [p.id, p]) ?? []);

    meetingRecords.forEach((r) => {
      const prof = meetingProfileMap.get(r.user_id);
      sheet.addRow({
        name: prof?.full_name || "N/A",
        regNo: prof?.reg_no || "N/A",
        method: r.method,
        status: r.status,
        createdAt: r.created_at ? new Date(r.created_at).toLocaleString() : "N/A",
      });
    });
  }

  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
