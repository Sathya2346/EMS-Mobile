import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

export interface HourlyReportEntry {
  employeeId: string;
  employeeName: string;
  timeSlot: string;
  taskDescription: string;
  status: string;
}

// POST /user/submitHourlyReports
export async function submitHourlyReports(reports: HourlyReportEntry[]): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/user/submitHourlyReports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reports),
  });
  return response.ok;
}
