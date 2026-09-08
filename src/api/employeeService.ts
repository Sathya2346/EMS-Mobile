/**
 * Field names mirror the real Employee JPA entity
 * (com.example.employeemanagement.model.Employee) directly — gender,
 * dateOfBirth, phone, address, city, blood, emergencyNumber,
 * language, maritalStatus are genuinely top-level fields on Employee
 * itself (not nested), confirmed against the actual source.
 */

export interface CompanyDetails {
  employeeEmail?: string | null;
  designation: string | null;
  shiftTiming: string | null;
  joiningDate: string | null;
  leavingDate?: string | null;
  status?: string | null;
}

export interface BankDetails {
  accHolderName: string | null;
  branchName: string | null;
  bankName: string | null;
  accNumber: string | null;
  ifscCode: string | null;
  panCard: string | null;
}

export interface Employee {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  city?: string | null;
  blood?: string | null;
  emergencyNumber?: string | null;
  language?: string | null;
  maritalStatus?: string | null;
  userType: 'ROLE_USER' | 'ROLE_ADMIN' | string;
  profileImageSrc: string | null;
  overallStatus: string;
  activityStatus: 'Working' | 'Break' | 'On Break' | 'Meeting' | 'In Meeting' | 'Leave' | 'Absent' | string;
  companyDetails: CompanyDetails | null;
  bankDetails?: BankDetails | null;
}

export interface UserDashboardData {
  employee: Employee;
  pendingCompanyDetails: boolean;
  userUnreadCount: number;
}

import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

/**
 * `/user/userDashboard/{id}` (UserController) is a Thymeleaf view — no
 * `@ResponseBody`, so it can't be used from this app. The employee data
 * comes from GET /api/employees/{id} (EmployeeRestController) instead;
 * `pendingCompanyDetails` is derived the same way
 * `LeaveController.showUserLeavePage` itself checks it (missing/blank
 * designation, joiningDate, or shiftTiming), and the unread notification
 * badge count comes from NotificationRestController's dedicated endpoint.
 */
export async function getUserDashboardData(employeeId: number): Promise<UserDashboardData> {
  const [empResponse, unreadResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
      ...DEFAULT_FETCH_OPTIONS,
      headers: { Accept: 'application/json' },
    }),
    fetch(`${API_BASE_URL}/api/notifications/unread/count?username=${employeeId}`, {
      ...DEFAULT_FETCH_OPTIONS,
      headers: { Accept: 'application/json' },
    }).catch(() => null),
  ]);
  if (!empResponse.ok) {
    throw new Error('Failed to load dashboard data.');
  }
  const employee: Employee = await empResponse.json();
  const unreadData = unreadResponse && unreadResponse.ok ? await unreadResponse.json() : { count: 0 };

  const cd = employee.companyDetails;
  const pendingCompanyDetails =
    !cd || !cd.designation || !cd.designation.trim() || !cd.joiningDate || !cd.shiftTiming || !cd.shiftTiming.trim();

  return {
    employee,
    pendingCompanyDetails,
    userUnreadCount: unreadData.count ?? 0,
  };
}

// GET /attendance/status/{employeeId} — confirmed real & JSON (AttendanceController)
export async function getActivityStatus(
  employeeId: number,
): Promise<{ activityStatus: Employee['activityStatus'] }> {
  const response = await fetch(`${API_BASE_URL}/attendance/status/${employeeId}`, DEFAULT_FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error('Failed to load activity status.');
  }
  return response.json();
}
