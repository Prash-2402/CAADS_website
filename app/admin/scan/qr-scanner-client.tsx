"use client";

import { useEffect, useState, useRef } from "react";
import { processScan } from "./actions";
import { Html5Qrcode } from "html5-qrcode";
import { Play, Square, CheckCircle2, AlertTriangle, Scan, RefreshCw } from "lucide-react";

type QrScannerClientProps = {
  events: any[];
};

export default function QrScannerClient({ events }: QrScannerClientProps) {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [cameraError, setCameraError] = useState("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-reader-container";

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!selectedEventId) {
      setCameraError("Please select an event before scanning.");
      return;
    }

    setCameraError("");
    setScanResult(null);

    try {
      const html5Qrcode = new Html5Qrcode(scannerId);
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          },
        },
        async (decodedText) => {
          // Success callback
          // Pause scanning temporarily (just ignore new scans until processed)
          setIsScanning(false);
          await html5Qrcode.stop();

          // Process the scan
          const res = await processScan(selectedEventId, decodedText);
          if (res.success) {
            setScanResult({
              success: true,
              message: `Successfully checked in ${res.name}!`,
            });
            // Play a subtle success sound if desired
            playBeep(true);
          } else {
            setScanResult({
              success: false,
              message: res.error || "Verification failed.",
            });
            playBeep(false);
          }
        },
        () => {
          // Silent failure on raw frame check
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error(err);
      setCameraError("Failed to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
    setIsScanning(false);
  };

  // Play a simple check-in audio feedback using Web Audio API
  const playBeep = (isSuccess: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(isSuccess ? 880 : 330, ctx.currentTime); // High pitch for success, low for fail
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isSuccess ? 0.15 : 0.3));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + (isSuccess ? 0.15 : 0.3));
    } catch (e) {
      console.warn("Audio context not supported or blocked by browser policy");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Configuration Column */}
      <div className="bg-bg-secondary border border-border-gold rounded-2xl p-6 h-fit space-y-6">
        <h3 className="font-display text-lg font-bold text-ivory">Check-in Config</h3>

        <div className="space-y-2">
          <label htmlFor="event-select" className="block text-sm font-medium text-ivory font-display">
            Select Target Event *
          </label>
          <select
            id="event-select"
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              stopScanner();
              setScanResult(null);
            }}
            disabled={isScanning}
            className="w-full bg-bg border border-border-gold/30 rounded-xl px-4 py-3 text-ivory focus:border-gold outline-none transition-all font-body text-sm disabled:opacity-50"
          >
            <option value="">-- Select Event --</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        {cameraError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-body flex items-center gap-2">
            <AlertTriangle size={16} className="flex-shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {!isScanning ? (
            <button
              onClick={startScanner}
              disabled={!selectedEventId}
              className="w-full py-3 px-4 rounded-xl bg-gold hover:bg-gold-bright text-bg font-semibold text-center transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play size={18} />
              Start Scanner
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="w-full py-3 px-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 font-semibold text-center transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Square size={18} />
              Stop Scanner
            </button>
          )}
        </div>
      </div>

      {/* Camera & Feed Column */}
      <div className="md:col-span-2 space-y-6">
        {/* Scanner frame */}
        <div className="bg-bg-secondary border border-border-gold rounded-2xl overflow-hidden relative aspect-video flex flex-col items-center justify-center min-h-[300px]">
          <div
            id={scannerId}
            className={`w-full h-full object-cover ${!isScanning ? "hidden" : "block"}`}
          />

          {!isScanning && (
            <div className="absolute inset-0 bg-bg/90 flex flex-col items-center justify-center text-muted p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-border-gold/30 flex items-center justify-center text-gold">
                <Scan size={32} className="animate-pulse" />
              </div>
              <div>
                <p className="font-display font-semibold text-ivory">Camera Feed Off</p>
                <p className="text-xs max-w-xs mt-1">
                  Select an event and click Start Scanner to run the camera.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Scan Results Feedback */}
        {scanResult && (
          <div
            className={`p-6 rounded-2xl border flex items-start gap-4 transition-all animate-fade-in-up ${
              scanResult.success
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            <div className="mt-0.5">
              {scanResult.success ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="font-display font-bold text-lg">
                {scanResult.success ? "Scan Success" : "Scan Error"}
              </h4>
              <p className="font-body text-sm text-muted">{scanResult.message}</p>
              <button
                onClick={startScanner}
                className="mt-2 text-xs font-semibold underline flex items-center gap-1 hover:text-ivory transition-colors"
              >
                <RefreshCw size={12} /> Scan Next Attendee
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
