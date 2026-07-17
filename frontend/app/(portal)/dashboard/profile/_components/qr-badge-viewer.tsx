"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Loader2 } from "lucide-react";
import { generateQrKeyAction } from "../actions";

export function QrBadgeViewer({ 
  userId, 
  initialKey, 
  appUrl 
}: { 
  userId: string;
  initialKey: string | null;
  appUrl: string;
}) {
  const [qrKey, setQrKey] = useState<string | null>(initialKey);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function generateImage() {
      if (!qrKey) return;
      try {
        const badgeUrl = `${appUrl}/id/${userId}/${qrKey}`;
        const dataUrl = await QRCode.toDataURL(badgeUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#C9A227', // gold
            light: '#0A0A0A' // bg
          }
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error(err);
        setError("Failed to generate QR image locally.");
      }
    }
    generateImage();
  }, [qrKey, userId, appUrl]);

  async function handleGenerateKey() {
    setIsGenerating(true);
    setError(null);
    const result = await generateQrKeyAction();
    if (result.error) {
      setError(result.error);
    } else if (result.key) {
      setQrKey(result.key);
    }
    setIsGenerating(false);
  }

  if (!qrKey) {
    return (
      <div className="bg-bg p-6 rounded-xl border border-border-gold/30 text-center space-y-4 max-w-sm mx-auto">
        <p className="font-body text-sm text-muted">
          You don&apos;t have a personal QR badge key generated yet.
        </p>
        <button
          onClick={handleGenerateKey}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-bg font-semibold hover:bg-gold-bright transition-colors disabled:opacity-50"
        >
          {isGenerating && <Loader2 size={16} className="animate-spin" />}
          Generate Badge
        </button>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-bg p-6 rounded-xl border border-border-gold/30 flex flex-col items-center max-w-sm mx-auto space-y-6">
      <div className="w-full aspect-square bg-bg-secondary rounded-lg flex items-center justify-center p-4 border border-border-gold/50 shadow-inner">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Your Personal QR Badge" className="w-full h-full object-contain rounded-md" />
        ) : (
          <Loader2 size={32} className="animate-spin text-gold" />
        )}
      </div>

      <div className="w-full space-y-3">
        <p className="text-center font-body text-xs text-muted">
          Show this QR code at events for quick check-in.
        </p>
        
        {qrDataUrl && (
          <a
            href={qrDataUrl}
            download={`CAADS-Badge-${userId.substring(0,6)}.png`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold/10 text-gold border border-gold hover:bg-gold hover:text-bg font-semibold transition-colors"
          >
            <Download size={18} />
            Download Badge
          </a>
        )}
      </div>
    </div>
  );
}
