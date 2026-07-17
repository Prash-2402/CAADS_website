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

  // Fetch event details
  const { data: event } = await supabase.from("events").select("title").eq("id", eventId).single();
  const eventTitle = event?.title || "Event";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CAADS Platform";
  workbook.created = new Date();

  // 1. Sheet: Registrations
  const regSheet = workbook.addWorksheet("Registrations");
  regSheet.columns = [
    { header: "Full Name", key: "name", width: 30 },
    { header: "Registration No", key: "regNo", width: 20 },
    { header: "Role", key: "role", width: 15 },
    { header: "Registered At", key: "registeredAt", width: 25 },
  ];

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("registered_at, profiles(full_name, reg_no, role)")
    .eq("event_id", eventId);

  registrations?.forEach((r) => {
    const prof = r.profiles as any;
    regSheet.addRow({
      name: prof?.full_name || "N/A",
      regNo: prof?.reg_no || "N/A",
      role: prof?.role || "N/A",
      registeredAt: new Date(r.registered_at).toLocaleString(),
    });
  });

  // Apply basic header styling
  regSheet.getRow(1).font = { bold: true };

  // 2. Sheet: Attendance
  const attSheet = workbook.addWorksheet("Attendance");
  attSheet.columns = [
    { header: "Full Name", key: "name", width: 30 },
    { header: "Registration No", key: "regNo", width: 20 },
    { header: "Check-in Method", key: "method", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Checked At", key: "checkedAt", width: 25 },
  ];

  const { data: attendance } = await supabase
    .from("attendance")
    .select("method, status, updated_at, profiles(full_name, reg_no)")
    .eq("event_id", eventId);

  attendance?.forEach((a) => {
    const prof = a.profiles as any;
    attSheet.addRow({
      name: prof?.full_name || "N/A",
      regNo: prof?.reg_no || "N/A",
      method: a.method,
      status: a.status,
      checkedAt: new Date(a.updated_at).toLocaleString(),
    });
  });

  attSheet.getRow(1).font = { bold: true };

  // 3. Sheet: Yellow Forms
  const yfSheet = workbook.addWorksheet("Yellow Forms");
  yfSheet.columns = [
    { header: "Full Name", key: "name", width: 30 },
    { header: "Registration No", key: "regNo", width: 20 },
    { header: "Periods Missed", key: "periods", width: 25 },
    { header: "Status", key: "status", width: 15 },
    { header: "Requested At", key: "createdAt", width: 25 },
  ];

  const { data: yellowForms } = await supabase
    .from("yellow_forms")
    .select("periods, status, created_at, profiles(full_name, reg_no)")
    .eq("event_id", eventId);

  yellowForms?.forEach((yf) => {
    const prof = yf.profiles as any;
    yfSheet.addRow({
      name: prof?.full_name || "N/A",
      regNo: prof?.reg_no || "N/A",
      periods: yf.periods.join(", "),
      status: yf.status,
      createdAt: new Date(yf.created_at).toLocaleString(),
    });
  });

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

  const { data: yellowForms } = await supabase
    .from("yellow_forms")
    .select(`
      periods,
      status,
      created_at,
      profiles (
        full_name,
        reg_no
      ),
      events (
        title
      )
    `)
    .order("created_at", { ascending: false });

  yellowForms?.forEach((yf) => {
    const prof = yf.profiles as any;
    const ev = yf.events as any;
    sheet.addRow({
      name: prof?.full_name || "N/A",
      regNo: prof?.reg_no || "N/A",
      eventTitle: ev?.title || "N/A",
      periods: yf.periods.join(", "),
      status: yf.status,
      createdAt: new Date(yf.created_at).toLocaleString(),
    });
  });

  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
