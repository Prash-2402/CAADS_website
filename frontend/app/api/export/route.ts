import { NextResponse } from "next/server";
import { getRole } from "@/lib/supabase/auth";
import { buildEventMultiSheetExport, buildYellowFormsExport } from "@/lib/export/excel";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Gate to leaders only
    const role = await getRole();
    if (role !== "core_team" && role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("event_id");
    const type = searchParams.get("type");

    let buffer: Buffer;
    let filename = "export.xlsx";

    if (eventId) {
      buffer = await buildEventMultiSheetExport(eventId);
      filename = `event-${eventId}-export.xlsx`;
    } else if (type === "yellow_forms") {
      buffer = await buildYellowFormsExport();
      filename = "yellow-forms-export.xlsx";
    } else {
      return new NextResponse("Invalid export request parameters.", { status: 400 });
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("Excel Export API Failed:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
