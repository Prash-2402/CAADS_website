import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import EditEventForm from "./edit-event-form";
import QrCodeSection from "./qr-code-section";
import QRCode from "qrcode";

export const metadata = {
  title: "Edit Event - CAADS",
};

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) {
    notFound();
  }

  // Generate QR code data URL server-side
  let qrCodeDataUrl = "";
  if (event.qr_secret) {
    // Format: base URL /events/[id]/claim?secret=[qr_secret]
    // In production, we'll use the request host, but for now we'll construct relative or mock origin
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const claimUrl = `${origin}/events/${event.id}/claim?secret=${event.qr_secret}`;
    try {
      qrCodeDataUrl = await QRCode.toDataURL(claimUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#C9A227", // Gold
          light: "#151515", // Bg Secondary
        },
      });
    } catch (err) {
      console.error("Failed to generate QR code", err);
    }
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/events" className="text-muted hover:text-ivory transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-ivory">Manage Event</h1>
          <p className="font-body text-muted mt-1">Edit details, view stats, and configure QR settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Edit Form */}
        <div className="lg:col-span-2 bg-bg-secondary border border-border-gold rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-xl font-bold text-ivory mb-6">Event Details</h2>
          <EditEventForm event={event} />
        </div>

        {/* QR Code and Actions */}
        <div className="space-y-8">
          <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 flex flex-col items-center">
            <h2 className="font-display text-lg font-bold text-ivory mb-4 self-start">Event Check-In QR</h2>
            <QrCodeSection
              eventId={event.id}
              initialQrCodeDataUrl={qrCodeDataUrl}
              qrSecret={event.qr_secret || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
