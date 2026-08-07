/**
 * Period time slot definitions for CAADS attendance tracking.
 * All times are in IST (Asia/Kolkata, UTC+5:30).
 *
 * P1: 9:00–10:00
 * P2: 10:00–11:00
 * P3: 11:00–12:00
 * P4: 12:00–13:00
 * P5: 14:00–15:00
 * P6: 15:00–16:00
 */

const PERIODS = [
  { key: "P1", startH: 9,  startM: 0,  endH: 10, endM: 0,  label: "9:00–10:00"  },
  { key: "P2", startH: 10, startM: 0,  endH: 11, endM: 0,  label: "10:00–11:00" },
  { key: "P3", startH: 11, startM: 0,  endH: 12, endM: 0,  label: "11:00–12:00" },
  { key: "P4", startH: 12, startM: 0,  endH: 13, endM: 0,  label: "12:00–13:00" },
  { key: "P5", startH: 14, startM: 0,  endH: 15, endM: 0,  label: "14:00–15:00" },
  { key: "P6", startH: 15, startM: 0,  endH: 16, endM: 0,  label: "15:00–16:00" },
] as const;

const TIMEZONE = "Asia/Kolkata";

function toMinutes(h: number, m: number): number {
  return h * 60 + m;
}

/** Extract hour + minute in IST from a UTC Date object. */
function getISTHourMinute(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour:   "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);

  const hour   = parseInt(parts.find((p) => p.type === "hour")?.value   ?? "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return { hour, minute };
}

/**
 * Given a check-in ISO string and an optional check-out ISO string,
 * returns the period keys (e.g. ["P1", "P2"]) that were covered.
 *
 * - If checkOut is not supplied, only the period containing checkIn is returned.
 * - If checkOut is supplied, all periods between checkIn and checkOut are returned.
 * - IST (Asia/Kolkata) is used for all hour comparisons.
 */
export function computePeriodsFromISO(
  checkInISO: string,
  checkOutISO?: string | null,
): string[] {
  const checkIn = new Date(checkInISO);
  const { hour: inH, minute: inM } = getISTHourMinute(checkIn);
  const inMinutes = toMinutes(inH, inM);

  let outMinutes: number;
  if (checkOutISO) {
    const checkOut = new Date(checkOutISO);
    const { hour: outH, minute: outM } = getISTHourMinute(checkOut);
    outMinutes = toMinutes(outH, outM);
  } else {
    // Without a check-out, only count the period containing check-in
    outMinutes = inMinutes + 1;
  }

  const result: string[] = [];
  for (const p of PERIODS) {
    const pStart = toMinutes(p.startH, p.startM);
    const pEnd   = toMinutes(p.endH,   p.endM);
    // Period overlaps with [inMinutes, outMinutes)
    if (inMinutes < pEnd && outMinutes > pStart) {
      result.push(p.key);
    }
  }
  return result;
}

/** Build a full ISO timestamp from a date string (YYYY-MM-DD) and time string (HH:mm) in IST. */
export function buildISTTimestamp(date: string, time: string): string {
  // "+05:30" makes the date/time be interpreted as IST
  return new Date(`${date}T${time}:00+05:30`).toISOString();
}

export function getPeriodLabel(key: string): string {
  return PERIODS.find((p) => p.key === key)?.label ?? key;
}

export function getAllPeriods(): { key: string; label: string }[] {
  return PERIODS.map((p) => ({ key: p.key, label: p.label }));
}
