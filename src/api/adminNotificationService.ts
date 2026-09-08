import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

export interface AdminNotification {
  id: number;
  type: 'Leave' | 'Approved Leave' | 'Rejected Leave' | 'Onboarding' | 'HourlyReport' | 'Attendance' | string;
  readStatus: boolean;
  title?: string;
  message?: string;
  employeeName?: string;
  leaveType?: string;
  leaveStatus?: string;
  leaveFromDate?: string;
  leaveToDate?: string;
  referenceId?: number;
}

// GET /admin/notification/list
export async function getAdminNotifications(): Promise<AdminNotification[]> {
  const response = await fetch(`${API_BASE_URL}/admin/notification/list`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load notifications.');
  }
  return response.json();
}

// POST /admin/notification/markRead/{id}
export async function markAdminNotificationRead(id: number): Promise<void> {
  await fetch(`${API_BASE_URL}/admin/notification/markRead/${id}`, { method: 'POST' });
}
