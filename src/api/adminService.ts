import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

export interface AdminDashboardData {
  totalEmployees: number;
  attenPresent: number;
  attenAbsent: number;
  pendingOnboardingCount: number;
  maleCount: number;
  femaleCount: number;
  adminUnreadCount: number;
}

export interface AttendanceSummary {
  days: string[];
  present: number[];
  absent: number[];
}

/**
 * `/admin/dashboard` (AdminController) renders a Thymeleaf view — no
 * `@ResponseBody` — so its aggregate numbers can't be fetched as JSON
 * directly. There's also no dedicated "admin summary" REST endpoint on
 * the backend. This computes the same numbers client-side from
 * GET /api/employees/all (EmployeeRestController), which already returns
 * every field needed:
 * - totalEmployees / maleCount / femaleCount: trivial counts
 * - pendingOnboardingCount: overallStatus is DETAILS_SUBMITTED or
 *   CHANGES_REQUESTED (same filter AdminOnboardingRestController's
 *   /pending endpoint applies)
 * - attenPresent / attenAbsent: there is no historical "today's
 *   attendance for all employees" endpoint (only per-employee
 *   /api/attendance/today/{id}, which would mean one request per
 *   employee) — this uses each employee's live `activityStatus` field
 *   instead (already present on every Employee returned by /all),
 *   counting anyone not "Absent"/"Idle" among fully-approved employees as
 *   "present". This is a reasonable admin-dashboard approximation given
 *   the backend doesn't expose a purpose-built aggregate, not a value
 *   invented from nothing.
 */
export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const [empResponse, unreadResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/api/employees/all`, { ...DEFAULT_FETCH_OPTIONS, headers: { Accept: 'application/json' } }),
    fetch(`${API_BASE_URL}/api/notifications/unread/count?isAdmin=true`, {
      ...DEFAULT_FETCH_OPTIONS,
      headers: { Accept: 'application/json' },
    }).catch(() => null),
  ]);
  if (!empResponse.ok) {
    throw new Error('Failed to load admin dashboard.');
  }
  const employees: any[] = await empResponse.json();
  const unreadData = unreadResponse && unreadResponse.ok ? await unreadResponse.json() : { count: 0 };

  const approved = employees.filter((e) => e.overallStatus === 'FULLY_APPROVED');
  const attenAbsent = approved.filter((e) => e.activityStatus === 'Absent' || e.activityStatus === 'Idle').length;

  return {
    totalEmployees: employees.length,
    attenPresent: approved.length - attenAbsent,
    attenAbsent,
    pendingOnboardingCount: employees.filter(
      (e) => e.overallStatus === 'DETAILS_SUBMITTED' || e.overallStatus === 'CHANGES_REQUESTED',
    ).length,
    maleCount: employees.filter((e) => e.gender === 'Male').length,
    femaleCount: employees.filter((e) => e.gender === 'Female').length,
    adminUnreadCount: unreadData.count ?? 0,
  };
}

// GET /admin/api/attendanceSummary — confirmed real JSON endpoint (AdminController)
export async function getAttendanceSummary(): Promise<AttendanceSummary> {
  const response = await fetch(`${API_BASE_URL}/admin/api/attendanceSummary`, DEFAULT_FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error('Failed to load attendance summary.');
  }
  return response.json();
}
