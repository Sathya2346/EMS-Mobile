import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Share } from 'react-native';
import { AttendanceRow } from '../components/user/AttendanceTable';

/**
 * Port of the jsPDF + jspdf-autotable report built in the
 * `downloadAttendanceBtn` click handler of userAttendance.js: a teal
 * "My Attendance Report" title, the employee name, a period/generated-on
 * line, then a 7-column table (Date, Shift, Check In, Check Out, Meeting,
 * Remarks, Status) with a teal header row and alternating light-teal rows.
 *
 * `react-native-html-to-pdf` (HTML -> PDF, no canvas drawing calls needed)
 * stands in for jsPDF, since jsPDF itself is a browser/canvas library with
 * no RN build. Saving is done via the OS share sheet (RN's built-in Share
 * API) rather than a browser download, matching how a mobile app "downloads"
 * a file.
 */
export async function exportAttendancePdf(
  employeeName: string,
  dateRangeLabel: string,
  rows: AttendanceRow[],
): Promise<void> {
  if (rows.length === 0) {
    throw new Error(
      'No attendance records found for the selected period. Cannot download an empty report.',
    );
  }

  const tableRows = rows
    .map(
      (r, i) => `
      <tr style="background-color:${i % 2 === 1 ? '#eaf9f0' : '#ffffff'};">
        <td>${r.date}</td>
        <td>${r.shift}</td>
        <td>${r.checkIn}</td>
        <td>${r.checkOut}</td>
        <td>${r.meeting}</td>
        <td>${r.remarks}</td>
        <td>${r.status}</td>
      </tr>`,
    )
    .join('');

  const html = `
    <html>
      <body style="font-family: Helvetica, Arial, sans-serif; text-align:center;">
        <h2 style="color:#23d2aa; margin-bottom:4px;">My Attendance Report</h2>
        <p style="color:#666; margin:2px;">Employee: ${employeeName || 'N/A'}</p>
        <p style="color:#666; margin:2px 0 16px;">${dateRangeLabel}</p>
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background-color:#23d2aa; color:#ffffff;">
              <th style="padding:6px; border:1px solid #ddd;">Date</th>
              <th style="padding:6px; border:1px solid #ddd;">Shift</th>
              <th style="padding:6px; border:1px solid #ddd;">Check In</th>
              <th style="padding:6px; border:1px solid #ddd;">Check Out</th>
              <th style="padding:6px; border:1px solid #ddd;">Meeting</th>
              <th style="padding:6px; border:1px solid #ddd;">Remarks</th>
              <th style="padding:6px; border:1px solid #ddd;">Status</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>`;

  const file = await RNHTMLtoPDF.convert({
    html,
    fileName: 'My_Attendance_Report',
    base64: false,
  });

  if (file.filePath) {
    await Share.share({ url: `file://${file.filePath}`, title: 'My Attendance Report' });
  }
}
