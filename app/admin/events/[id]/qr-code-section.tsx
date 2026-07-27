"use client";

import { useState, useTransition } from "react";
import { rotateQrSecret } from "../actions";
import { RefreshCw, Download } from "lucide-react";
import { useRouter } from "next/navigation";

type QrCodeSectionProps = {
  eventId: string;
  initialQrCodeDataUrl: string;
  qrSecret: string;
};

export default function QrCodeSection({
  eventId,
  initialQrCodeDataUrl,
  qrSecret,
}: QrCodeSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleRotate = () => {
    if (!confirm("Are you sure you want to rotate the QR secret? This will invalidate the existing QR code immediately.")) {
      return;
    }

    setError("");
    startTransition(async () => {
      const res = await rotateQrSecret(eventId);
      if (res.success) {
        router.refresh();
      } else {
        setError(res.error || "Failed to rotate QR secret");
      }
    });
  };

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      {error && (
        <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-body">
          {error}
        </div>
      )}

      {initialQrCodeDataUrl ? (
        <div className="p-4 bg-bg rounded-2xl border border-border-gold/30 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={initialQrCodeDataUrl}
            alt="Check-in QR Code"
            className="w-64 h-64 object-contain rounded-xl"
          />
        </div>
      ) : (
        <div className="w-64 h-64 rounded-2xl border border-dashed border-border-gold/30 bg-bg flex items-center justify-center text-muted text-sm font-body">
          No QR generated
        </div>
      )}

      <div className="w-full text-center space-y-1">
        <p className="text-xs text-muted font-mono select-all">Secret: {qrSecret || "None"}</p>
        <p className="text-xs text-muted font-body">
          This QR code checks students in immediately when scanned.
        </p>
      </div>

      <div className="flex gap-3 w-full">
        {initialQrCodeDataUrl && (
          <a
            href={initialQrCodeDataUrl}
            download={`event-checkin-${eventId}.png`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-bg border border-border-gold/50 text-ivory font-semibold text-sm hover:bg-gold/10 transition-colors"
          >
            <Download size={16} /> Download
          </a>
        )}
        <button
          onClick={handleRotate}
          disabled={isPending}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold/10 border border-gold/30 hover:bg-gold hover:text-bg text-gold font-semibold text-sm transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={isPending ? "animate-spin" : ""} />
          {isPending ? "Rotating..." : "Rotate Secret"}
        </button>
      </div>
    </div>
  );
}
