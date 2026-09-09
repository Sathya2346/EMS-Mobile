import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { AttendanceRow } from '../components/user/AttendanceTable';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function exportAttendancePdf(
  employeeName: string,
  dateRangeLabel: string,
  rows: AttendanceRow[],
): Promise<void> {
  if (rows.length === 0) {
    throw new Error('No attendance records found for the selected period. Cannot download an empty report.');
  }

  const tableRows = rows.map((r, i) => `
    <tr style="background-color:${i % 2 === 1 ? '#eaf9f0' : '#ffffff'};">
      <td>${escapeHtml(r.date)}</td><td>${escapeHtml(r.shift)}</td>
      <td>${escapeHtml(r.checkIn)}</td><td>${escapeHtml(r.checkOut)}</td>
      <td>${escapeHtml(r.meeting)}</td><td>${escapeHtml(r.remarks)}</td>
      <td>${escapeHtml(r.status)}</td>
    </tr>`).join('');

  const html = `<!doctype html><html><body style="font-family:Helvetica,Arial,sans-serif;text-align:center;">
    <h2 style="color:#23d2aa;margin-bottom:4px;">My Attendance Report</h2>
    <p style="color:#666;margin:2px;">Employee: ${escapeHtml(employeeName || 'N/A')}</p>
    <p style="color:#666;margin:2px 0 16px;">${escapeHtml(dateRangeLabel)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background-color:#23d2aa;color:#fff;">
      <th>Date</th><th>Shift</th><th>Check In</th><th>Check Out</th><th>Meeting</th><th>Remarks</th><th>Status</th>
    </tr></thead><tbody>${tableRows}</tbody></table></body></html>`;

  const file = await Print.printToFileAsync({ html });
  if (file.uri && await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: 'My Attendance Report' });
  }
}
