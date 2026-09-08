import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

export interface AdminLeaveRecord {
  id: number;
  employeeName?: string;
  employee?: { firstname: string; lastname: string };
  leaveType: string;
  leaveFromDate: string;
  leaveToDate: string;
  leaveDays: number;
  leaveApprovedBy: string | null;
  leaveStatus: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | string;
}

export interface LeaveSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface LeaveFilterParams {
  name?: string;
  status?: string;
  from?: string;
  to?: string;
}

// GET /admin/leave/summary
export async function getLeaveSummary(): Promise<LeaveSummary> {
  const response = await fetch(`${API_BASE_URL}/admin/leave/summary`);
  if (!response.ok) {
    throw new Error('Failed to fetch summary.');
  }
  return response.json();
}

// GET /leave/all
export async function getAllLeaves(): Promise<AdminLeaveRecord[]> {
  const response = await fetch(`${API_BASE_URL}/leave/all`);
  if (!response.ok) {
    throw new Error('Failed to load leaves.');
  }
  return response.json();
}

function buildParams(filters: LeaveFilterParams): string {
  const params = new URLSearchParams();
  if (filters.name) params.append('name', filters.name);
  if (filters.status) params.append('status', filters.status);
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);
  return params.toString();
}

// GET /leave/filter?name=&status=&from=&to=
export async function filterLeaves(filters: LeaveFilterParams): Promise<AdminLeaveRecord[]> {
  const response = await fetch(`${API_BASE_URL}/leave/filter?${buildParams(filters)}`);
  if (!response.ok) {
    throw new Error('Filter request failed.');
  }
  return response.json();
}

// GET /admin/leave/filter?from=&to=&name=&status= — used only for the PDF export
export async function filterLeavesForPdf(filters: LeaveFilterParams): Promise<AdminLeaveRecord[]> {
  const response = await fetch(`${API_BASE_URL}/admin/leave/filter?${buildParams(filters)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch leave data.');
  }
  return response.json();
}

export interface UpdateStatusResult {
  message: string;
  employeeId: number;
  leaveId: number;
  leaveStatus: string;
  leaveApprovedBy: string;
  leaveFromDate: string;
}

// POST /admin/leave/update-status/{id}?status=
export async function updateLeaveStatus(id: number, status: 'Approved' | 'Rejected'): Promise<UpdateStatusResult> {
  const response = await fetch(
    `${API_BASE_URL}/admin/leave/update-status/${id}?status=${encodeURIComponent(status)}`,
    { method: 'POST' },
  );
  if (!response.ok) {
    throw new Error('Failed to update status.');
  }
  return response.json();
}

// DELETE /admin/leave/delete/{id}
export async function deleteAdminLeave(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/admin/leave/delete/${id}`, { method: 'DELETE' });
  return response.ok;
}
