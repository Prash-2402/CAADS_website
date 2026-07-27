import { createClient } from "@/lib/supabase/server";
import QrScannerClient from "./qr-scanner-client";

export const metadata = {
  title: "QR Scan Mode - CAADS",
};

export default async function ScanPage() {
  const supabase = createClient();

  // Fetch events happening today or recently to show in dropdown
  const today = new Date().toISOString().split("T")[0];

  const { data: events } = await supabase
    .from("events")
    .select("id, title, date")
    .order("date", { ascending: false })
    .limit(10); // Show recent 10 events for check-in

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-ivory">QR Scan Mode</h1>
        <p className="font-body text-muted mt-1">Select an event and scan student or staff badges.</p>
      </div>

      <QrScannerClient events={events || []} />
    </div>
  );
}
