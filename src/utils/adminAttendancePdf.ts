import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Share } from 'react-native';
import { AdminAttendanceRecord } from '../api/adminAttendanceService';
import { format12HourTime, formatDuration } from './attendanceTime';

function formatMinutes(mins: number | undefined | null): string {
  if (mins == null || mins < 0) return '--';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h === 0 ? `${m}m` : `${h}h ${m}m`;
}

/**
 * Port of the jsPDF + autotable landscape report in attendance.js's
 * `pdfBtn` click handler: teal "Attendance Report" title, employee name +
 * date range, then the same 11-column table with a teal header and
 * alternating mint rows.
 */
export async function exportAdminAttendancePdf(
  employeeName: string,
  fromDate: string,
  toDate: string,
  rows: AdminAttendanceRecord[],
): Promise<void> {
  if (rows.length === 0) {
    throw new Error('No attendance records found for the selected range.');
  }

  const tableRows = rows
    .map((a, i) => {
      const remarks: string[] = [];
      if (a.lateIn || a.isLateIn) remarks.push(`Late (+${formatMinutes(a.lateMinutes)})`);
      if (a.earlyOut) remarks.push(`Early (-${formatMinutes(a.earlyLeaveMinutes)})`);
      const remarksStr = remarks.length > 0 ? remarks.join(', ') : '-';
      const empName = a.employee ? `${a.employee.firstname || ''} ${a.employee.lastname || ''}`.trim() : '-';
      return `
      <tr style="background-color:${i % 2 === 1 ? '#eaf9f0' : '#ffffff'};">
        <td>${a.attendanceDate}</td>
        <td>${empName}</td>
        <td>${a.employee?.companyDetails?.shiftTiming || 'N/A'}</td>
        <td>${format12HourTime(a.checkInTime)}</td>
        <td>${formatDuration(a.totalBreakTime || 0)}</td>
        <td>${formatMinutes(a.totalMeetingTime || 0)}</td>
        <td>${formatMinutes(a.idleTime)}</td>
        <td>${format12HourTime(a.checkOutTime)}</td>
        <td>${formatDuration(a.totalWorkTime || 0)}</td>
        <td>${remarksStr}</td>
        <td>${a.status || 'Working'}</td>
      </tr>`;
    })
    .join('');

  const html = `
    <html>
      <body style="font-family: Helvetica, Arial, sans-serif; text-align:center;">
        <h2 style="color:#23d2aa; margin-bottom:4px;">Attendance Report</h2>
        <p style="color:#666; margin:2px;">Employee: ${employeeName || 'N/A'}</p>
        <p style="color:#666; margin:2px 0 16px;">From: ${fromDate}&nbsp;&nbsp;&nbsp;To: ${toDate}</p>
        <table style="width:100%; border-collapse:collapse; font-size:9.5px;">
          <thead>
            <tr style="background-color:#23d2aa; color:#ffffff;">
              <th style="padding:5px; border:1px solid #ddd;">Date</th>
              <th style="padding:5px; border:1px solid #ddd;">Employee</th>
              <th style="padding:5px; border:1px solid #ddd;">Shift</th>
              <th style="padding:5px; border:1px solid #ddd;">Check-In</th>
              <th style="padding:5px; border:1px solid #ddd;">Break</th>
              <th style="padding:5px; border:1px solid #ddd;">Meeting</th>
              <th style="padding:5px; border:1px solid #ddd;">Idle</th>
              <th style="padding:5px; border:1px solid #ddd;">Check-Out</th>
              <th style="padding:5px; border:1px solid #ddd;">Work Time</th>
              <th style="padding:5px; border:1px solid #ddd;">Remarks</th>
              <th style="padding:5px; border:1px solid #ddd;">Status</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>`;

  const file = await RNHTMLtoPDF.convert({
    html,
    fileName: `Attendance_Report_${fromDate}_to_${toDate}`,
    base64: false,
  });

  if (file.filePath) {
    await Share.share({ url: `file://${file.filePath}`, title: 'Attendance Report' });
  }
}
