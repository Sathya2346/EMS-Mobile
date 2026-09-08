/**
 * Direct ports of the helper functions at the top of
 * static/js/userAttendance.js. All times are computed in IST
 * (Asia/Kolkata), same as the original, since attendance is recorded
 * against the employee's local (IST) workday regardless of device timezone.
 */

const IST_TIME_ZONE = 'Asia/Kolkata';

export function toIST(date: Date): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: IST_TIME_ZONE }));
}

export function formatTimeDisplay(date: Date | null): string {
  if (!date) return '--:--';
  return date.toLocaleTimeString('en-US', {
    timeZone: IST_TIME_ZONE,
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatTimeForDB(date: Date | null): string | null {
  if (!date) return null;
  const d = toIST(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatDateForDB(date: Date | null): string | null {
  if (!date) return null;
  const d = toIST(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getISTDateTimeString(date: Date = new Date()): string {
  const d = toIST(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  const padMs = (n: number) => String(n).padStart(3, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${padMs(d.getMilliseconds())}`;
}

export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return '0m 0s';
  const totalSec = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return hrs === 0 ? `${mins}m ${secs}s` : `${hrs}h ${mins}m ${secs}s`;
}

export function format12HourTime(timeVal: string | null | undefined): string {
  if (!timeVal || timeVal === '--:--' || timeVal === '-') return '--:--';
  if (/am|pm/i.test(timeVal)) return timeVal;
  const parts = timeVal.split(':');
  if (parts.length < 2) return timeVal;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, '0');
  const seconds = parts[2] ? parts[2].padStart(2, '0') : '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

export function parseTimeToMs(timeStr: string | null | undefined): number {
  if (!timeStr || timeStr === '--:--') return 0;
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const cleanStr = timeStr.replace(/(am|pm)/i, '').trim();
  const parts = cleanStr.split(':').map((n) => parseInt(n, 10) || 0);
  let hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}
