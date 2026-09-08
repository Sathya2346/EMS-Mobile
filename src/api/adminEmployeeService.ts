import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

/**
 * Rewritten against the real backend:
 * - List/create/update/delete an employee -> EmployeeRestController
 *   (`/api/employees/**`), the only JSON-returning surface for these —
 *   the root-path equivalents (`/admin/profile`, `/admin/save`,
 *   `/admin/updateEmployee/{id}`, `/admin/delete/{id}`) all return
 *   Thymeleaf view names / redirects, not JSON, so they can't be used
 *   from this app.
 * - Shift timings -> there's no standalone shift-timings endpoint;
 *   they come back as part of GET /admin/settings (AdminSettingsController),
 *   alongside the Settings object — see adminSettingsService.ts.
 */

export interface EmployeeListItem {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  profileImageSrc: string | null;
  overallStatus: string;
  activityStatus: string;
  companyDetails: {
    designation: string | null;
    status: string | null;
    joiningDate: string | null;
  } | null;
}

export interface AddEmployeePayload {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  userType: 'ROLE_USER' | 'ROLE_ADMIN';
}

export interface AddEmployeeResult {
  ok: boolean;
  errorMessage?: string;
}

export interface EmployeeFullDetails {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  blood: string | null;
  emergencyNumber: string | null;
  language: string | null;
  maritalStatus: string | null;
  username: string;
  userType: string;
  profileImageSrc: string | null;
  companyDetails: {
    employeeEmail: string | null;
    designation: string | null;
    shiftTiming: string | null;
    joiningDate: string | null;
    leavingDate: string | null;
    status: string | null;
  } | null;
  bankDetails: {
    accHolderName: string | null;
    branchName: string | null;
    bankName: string | null;
    accNumber: string | null;
    ifscCode: string | null;
    panCard: string | null;
  } | null;
}

export interface UpdateEmployeePayload {
  employeeEmail: string;
  designation: string;
  shiftTiming: string;
  joiningDate: string;
  leavingDate: string;
  status: string;
}

export interface UpdateEmployeeResult {
  ok: boolean;
  errorMessage?: string;
}

// GET /api/employees/all
export async function getEmployeeList(): Promise<{ employees: EmployeeListItem[]; totalEmployees: number }> {
  const response = await fetch(`${API_BASE_URL}/api/employees/all`, {
    ...DEFAULT_FETCH_OPTIONS,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load employee list.');
  }
  const employees: EmployeeListItem[] = await response.json();
  return { employees, totalEmployees: employees.length };
}

// GET /api/employees/{id}
export async function getEmployeeDetails(id: number): Promise<EmployeeFullDetails> {
  const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
    ...DEFAULT_FETCH_OPTIONS,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load employee details.');
  }
  return response.json();
}

// POST /api/employees/save  { firstname, lastname, email, username, userType }
// -> { success, message, employeeSent, employee }
// Note: unlike the web form, the REST API returns a general `message` on
// failure (e.g. "Username is already taken."), not per-field errors — so
// this surfaces as a single error banner rather than field-level messages.
export async function addEmployee(payload: AddEmployeePayload): Promise<AddEmployeeResult> {
  const response = await fetch(`${API_BASE_URL}/api/employees/save`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    return { ok: false, errorMessage: result.message || 'Failed to create employee.' };
  }
  return { ok: true };
}

// PUT /api/employees/{id}  { companyDetails: { employeeEmail, designation, shiftTiming, joiningDate, leavingDate, status } }
// Only Company Details are ever updated by this endpoint (matches the
// source form's own restriction), so the payload nests under companyDetails.
export async function updateEmployee(id: number, payload: UpdateEmployeePayload): Promise<UpdateEmployeeResult> {
  const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyDetails: {
        employeeEmail: payload.employeeEmail,
        designation: payload.designation,
        shiftTiming: payload.shiftTiming,
        joiningDate: payload.joiningDate,
        leavingDate: payload.leavingDate || null,
        status: payload.status,
      },
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    return { ok: false, errorMessage: result.message || 'Failed to update employee.' };
  }
  return { ok: true };
}

// DELETE /api/employees/delete/{id}
export async function deleteEmployee(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/employees/delete/${id}`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: 'DELETE',
  });
  return response.ok;
}
