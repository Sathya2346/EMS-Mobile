import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

export interface AdminAttendanceRecord {
  attendanceDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string | null;
  totalBreakTime?: number; // ms
  totalWorkTime?: number; // ms
  totalMeetingTime?: number; // minutes
  idleTime?: number; // minutes
  lateIn?: boolean;
  isLateIn?: boolean;
  lateMinutes?: number;
  earlyOut?: boolean;
  earlyLeaveMinutes?: number;
  earlyIn?: boolean;
  earlyCheckIn?: boolean;
  earlyInMinutes?: number;
  username?: string;
  employee?: {
    firstname: string;
    lastname: string;
    companyDetails?: { shiftTiming?: string | null; joiningDate?: string | null } | null;
  };
}

export interface EmployeeSearchResult {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  designation?: string | null;
  companyDetails?: { designation?: string | null; joiningDate?: string | null } | null;
}

// GET /admin/all — full employee list, used for the search-suggestions box
export async function getAllEmployeesForSearch(): Promise<EmployeeSearchResult[]> {
  const response = await fetch(`${API_BASE_URL}/admin/all`);
  if (!response.ok) {
    throw new Error('Failed to load employees.');
  }
  return response.json();
}

// GET /attendance/range/{employeeId}?from=&to=
export async function getAdminAttendanceRange(
  employeeId: number,
  from: string,
  to: string,
): Promise<AdminAttendanceRecord[]> {
  const response = await fetch(`${API_BASE_URL}/attendance/range/${employeeId}?from=${from}&to=${to}`);
  if (!response.ok) {
    throw new Error('Failed to load attendance range.');
  }
  return response.json();
}
