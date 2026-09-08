import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

export interface LeaveRecord {
  id: number;
  employeeName: string;
  leaveType: string;
  leaveFromDate: string;
  leaveToDate: string;
  leaveDays: number;
  leaveApprovedBy: string | null;
  leaveStatus: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | string;
}

export interface LeaveBalances {
  totalLeaves: number;
  paidLeaveBalance: number;
  sickLeaveBalance: number;
  casualLeaveBalance: number;
}

export interface ApplyLeavePayload {
  leaveType: string;
  leaveFromDate: string;
  leaveToDate: string;
  reason: string;
}

export interface ApplyLeaveResult {
  ok: boolean;
  field?: string; // matches backend's { field, message } validation error shape
  message?: string;
  leave?: LeaveRecord;
}

// GET /leave/userLeave/{employeeId} is a Thymeleaf view (no @ResponseBody) —
// the real JSON sources are /leave/user/{empId} (the leave list) and
// /leave/balance/{empId} (returns the Employee, whose totalLeaves/
// paidLeaveBalance/sickLeaveBalance/casualLeaveBalance fields are read
// directly below), fetched together.
export async function getUserLeaveData(employeeId: number): Promise<{
  leaves: LeaveRecord[];
  totalLeaves: number;
  paidLeaves: number;
  sickLeaves: number;
  casualLeaves: number;
}> {
  const [leavesRes, balanceRes] = await Promise.all([
    fetch(`${API_BASE_URL}/leave/user/${employeeId}`, { ...DEFAULT_FETCH_OPTIONS, headers: { Accept: 'application/json' } }),
    fetch(`${API_BASE_URL}/leave/balance/${employeeId}`, { ...DEFAULT_FETCH_OPTIONS, headers: { Accept: 'application/json' } }),
  ]);
  if (!leavesRes.ok || !balanceRes.ok) {
    throw new Error('Failed to load leave data.');
  }
  const leaves: LeaveRecord[] = await leavesRes.json();
  const employee = await balanceRes.json();
  return {
    leaves,
    totalLeaves: employee.totalLeaves ?? 0,
    paidLeaves: employee.paidLeaveBalance ?? 0,
    sickLeaves: employee.sickLeaveBalance ?? 0,
    casualLeaves: employee.casualLeaveBalance ?? 0,
  };
}

// GET /leave/balance/{employeeId} -> Employee
export async function getLeaveBalance(employeeId: number): Promise<LeaveBalances> {
  const response = await fetch(`${API_BASE_URL}/leave/balance/${employeeId}`, {
    ...DEFAULT_FETCH_OPTIONS,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch updated balances!');
  }
  const employee = await response.json();
  return {
    totalLeaves: employee.totalLeaves ?? 0,
    paidLeaveBalance: employee.paidLeaveBalance ?? 0,
    sickLeaveBalance: employee.sickLeaveBalance ?? 0,
    casualLeaveBalance: employee.casualLeaveBalance ?? 0,
  };
}

// POST /leave/applyLeave
export async function applyLeave(payload: ApplyLeavePayload): Promise<ApplyLeaveResult> {
  const response = await fetch(`${API_BASE_URL}/leave/applyLeave`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) {
    return { ok: false, field: result.field, message: result.message || 'Failed to apply leave!' };
  }
  return { ok: true, leave: result, message: result.message };
}

// POST /leave/cancel/{leaveId}
export async function cancelLeave(leaveId: number): Promise<{ ok: boolean; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/leave/cancel/${leaveId}`, { ...DEFAULT_FETCH_OPTIONS, method: 'POST' });
  const result = await response.json();
  return { ok: response.ok, message: result.message };
}
