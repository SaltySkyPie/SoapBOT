import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(duration);
dayjs.extend(utc);

export function formatDuration(ms: number): string {
  const d = dayjs.duration(ms);
  const parts: string[] = [];

  if (d.days()) parts.push(`${d.days()}d`);
  if (d.hours()) parts.push(`${d.hours()}h`);
  if (d.minutes()) parts.push(`${d.minutes()}m`);
  if (d.seconds() || parts.length === 0) parts.push(`${d.seconds()}s`);

  return parts.join(" ");
}

export function getTimeDifference(start: Date, end: Date): number {
  return Math.abs(dayjs(end).diff(dayjs(start)));
}

export function getCurrentTimestamp(): Date {
  return dayjs().toDate();
}

export function getFutureTimestamp(millisecondsFromNow: number): Date {
  return dayjs().add(millisecondsFromNow, "millisecond").toDate();
}

export function formatLogTimestamp(): string {
  return dayjs.utc().format("[[]D. M. YYYY H:m:s[]]");
}

export interface TimeRemaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function getTimeRemaining(start: string | Date, end: string | Date): TimeRemaining {
  const total = Math.abs(dayjs(end).diff(dayjs(start)));
  const d = dayjs.duration(total);

  return {
    total,
    days: Math.floor(d.asDays()),
    hours: d.hours(),
    minutes: d.minutes(),
    seconds: d.seconds(),
  };
}

export function getMysqlDateTime(millisecondsToAdd = 0): string {
  return dayjs.utc().add(millisecondsToAdd, "millisecond").format("YYYY-M-D H:m:s");
}

export function formatCooldownRemaining(remaining: TimeRemaining): string {
  const { days, hours, minutes, seconds } = remaining;
  const d = days ? `${days}d ` : "";
  const h = hours ? `${hours}h ` : "";
  const m = minutes ? `${minutes}m ` : "";
  const s = seconds ? `${seconds}s` : "0s";
  return `${d}${h}${m}${s}`.trim();
}
