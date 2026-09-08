import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

export interface HourlyReportCardEmployee {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

export interface HourlyReportRow {
  timeSlot: string;
  taskDescription: string;
  status: string;
  createdAt: string; // pre-formatted "yyyy-MM-dd HH:mm" server string
}

export interface HourlyReportPageData {
  employee: { id: number; firstname: string; lastname: string };
  reports: HourlyReportRow[];
}

// GET /admin/hourlyReports — employee list for the cards screen
export async function getHourlyReportEmployees(): Promise<HourlyReportCardEmployee[]> {
  const response = await fetch(`${API_BASE_URL}/admin/hourlyReports`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load employees.');
  }
  return response.json();
}

// GET /admin/hourlyReports/{employeeId}
export async function getHourlyReportsForEmployee(employeeId: number): Promise<HourlyReportPageData> {
  const response = await fetch(`${API_BASE_URL}/admin/hourlyReports/${employeeId}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load hourly reports.');
  }
  return response.json();
}

// GET /admin/hourlyReports/filter/{employeeId}?fromDate=&toDate=
export async function filterHourlyReports(
  employeeId: number,
  fromDate?: string,
  toDate?: string,
): Promise<HourlyReportRow[]> {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const response = await fetch(`${API_BASE_URL}/admin/hourlyReports/filter/${employeeId}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reports.');
  }
  return response.json();
}
