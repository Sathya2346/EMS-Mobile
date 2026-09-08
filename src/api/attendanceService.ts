import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

export interface AttendanceRecord {
  attendanceDate: string; // yyyy-MM-dd
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string | null;
  totalMeetingTime?: number; // minutes
  earlyInMinutes?: number;
  lateIn?: boolean;
  isLateIn?: boolean;
  lateMinutes?: number;
  earlyOut?: boolean;
  earlyLeaveMinutes?: number;
  earlyIn?: boolean;
  earlyCheckIn?: boolean;
  employee?: { companyDetails?: { shiftTiming?: string | null } | null };
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }
  return response.json();
}

async function postJson(path: string, body?: unknown): Promise<void> {
  await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// GET /attendance/last5/{employeeId}
export function getLast5(employeeId: number): Promise<AttendanceRecord[]> {
  return getJson(`/attendance/last5/${employeeId}`);
}

// GET /attendance/date/{employeeId}?date=yyyy-MM-dd
export function getByDate(employeeId: number, date: string): Promise<AttendanceRecord[]> {
  return getJson(`/attendance/date/${employeeId}?date=${date}`);
}

// GET /attendance/range/{employeeId}?from=yyyy-MM-dd&to=yyyy-MM-dd
export function getByRange(
  employeeId: number,
  from: string,
  to: string,
): Promise<AttendanceRecord[]> {
  return getJson(`/attendance/range/${employeeId}?from=${from}&to=${to}`);
}

// GET /attendance/status/{employeeId}
export function getStatus(employeeId: number): Promise<{ activityStatus: string }> {
  return getJson(`/attendance/status/${employeeId}`);
}

// POST /attendance/save/{employeeId}
export function saveAttendance(
  employeeId: number,
  payload: {
    attendanceDate: string;
    checkInTime?: string | null;
    checkOutTime?: string | null;
    totalWorkTime?: number;
    totalBreakTime?: number;
    idleTime?: number;
    username: string;
  },
): Promise<void> {
  return postJson(`/attendance/save/${employeeId}`, payload);
}

// POST /attendance/break/start  { time: ISO-ish IST string }
export function startBreak(time: string): Promise<void> {
  return postJson('/attendance/break/start', { time });
}

// POST /attendance/break/end
export function endBreak(time: string): Promise<void> {
  return postJson('/attendance/break/end', { time });
}

// POST /attendance/meeting/start
export function startMeeting(): Promise<void> {
  return postJson('/attendance/meeting/start');
}

// POST /attendance/meeting/end
export function endMeeting(): Promise<void> {
  return postJson('/attendance/meeting/end');
}
