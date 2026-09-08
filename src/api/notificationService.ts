import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

export interface NotificationItem {
  id: number;
  type: string;
  message: string;
  createdAt: string;
  readStatus: boolean;
  leaveStatus?: 'Approved' | 'Rejected' | string | null;
}

/**
 * `/user/notification/{id}` (UserNotificationController) renders a
 * Thymeleaf view, not JSON — the actual JSON source is
 * NotificationRestController's `/api/notifications/user/{userId}`.
 * Marking read still goes through the original root-path endpoint, which
 * genuinely is `@ResponseBody` (confirmed in source).
 */
export async function getUserNotifications(employeeId: number): Promise<NotificationItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/notifications/user/${employeeId}`, {
    ...DEFAULT_FETCH_OPTIONS,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load notifications.');
  }
  return response.json();
}

// POST /user/notification/markRead/{id}
export async function markUserNotificationRead(id: number): Promise<void> {
  await fetch(`${API_BASE_URL}/user/notification/markRead/${id}`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: 'POST',
  }).catch(() => {});
}
