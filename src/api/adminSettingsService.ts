import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

/**
 * The root-path `/admin/settings/**` controller (AdminSettingsController)
 * is entirely Thymeleaf view/redirect based — no `@ResponseBody` anywhere
 * on it — so none of it can be used from this app. Every call here goes
 * through the actual JSON REST layer instead: SettingsRestController at
 * `/api/admin/settings/**`.
 */

export interface AdminSettings {
  initialPaidLeave: number;
  initialSickLeave: number;
  initialCasualLeave: number;
  welcomeEmailSubject: string;
  welcomeEmailBody: string;
  receiptEmailSubject: string;
  receiptEmailBody: string;
  rejectionEmailSubject: string;
  rejectionEmailBody: string;
  approvalEmailSubject: string;
  approvalEmailBody: string;
  otpEmailSubject: string;
  otpEmailBody: string;
  adminAlertEmailSubject: string;
  adminAlertEmailBody: string;
  leaveApprovedEmailSubject: string;
  leaveApprovedEmailBody: string;
  leaveRejectedEmailSubject: string;
  leaveRejectedEmailBody: string;
}

export interface ShiftTimingItem {
  id: number;
  name: string;
}

// GET /api/admin/settings -> { settings, shiftTimings }
export async function getAdminSettings(): Promise<{ settings: AdminSettings; shiftTimings: ShiftTimingItem[] }> {
  const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
    ...DEFAULT_FETCH_OPTIONS,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load settings.');
  }
  return response.json();
}

// POST /api/admin/settings/save
export async function saveAdminSettings(settings: AdminSettings): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/admin/settings/save`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return response.ok;
}

// POST /api/admin/settings/shift/add  { name }
export async function addShiftTiming(name: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/admin/settings/shift/add`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return response.ok;
}

// POST /api/admin/settings/shift/update/{id}  { name }
export async function editShiftTiming(id: number, name: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/admin/settings/shift/update/${id}`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return response.ok;
}

// DELETE /api/admin/settings/shift/delete/{id}
export async function deleteShiftTiming(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/admin/settings/shift/delete/${id}`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: 'DELETE',
  });
  return response.ok;
}
