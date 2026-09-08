import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Share } from 'react-native';
import { LeaveRecord } from '../api/leaveService';

/**
 * Port of the jsPDF + autotable report in the `downloadLeaveBtn` handler
 * of userLeave.js: teal "My Leave Report" title, employee name +
 * generated-on line, then a 5-column table (Leave Type, From, To, Days,
 * Status). See attendancePdf.ts for why react-native-html-to-pdf +
 * the OS share sheet stand in for jsPDF + browser download.
 */
export async function exportLeavePdf(employeeName: string, leaves: LeaveRecord[]): Promise<void> {
  if (leaves.length === 0) {
    throw new Error(
      'No leave records found for the selected period. Cannot download an empty report.',
    );
  }

  const tableRows = leaves
    .map(
      (l, i) => `
      <tr style="background-color:${i % 2 === 1 ? '#eaf9f0' : '#ffffff'};">
        <td>${l.leaveType}</td>
        <td>${l.leaveFromDate}</td>
        <td>${l.leaveToDate}</td>
        <td>${l.leaveDays}</td>
        <td>${l.leaveStatus}</td>
      </tr>`,
    )
    .join('');

  const html = `
    <html>
      <body style="font-family: Helvetica, Arial, sans-serif; text-align:center;">
        <h2 style="color:#23d2aa; margin-bottom:4px;">My Leave Report</h2>
        <p style="color:#666; margin:2px;">Employee: ${employeeName || 'Employee'}</p>
        <p style="color:#666; margin:2px 0 16px;">Generated: ${new Date().toLocaleDateString()}</p>
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background-color:#23d2aa; color:#ffffff;">
              <th style="padding:6px; border:1px solid #ddd;">Leave Type</th>
              <th style="padding:6px; border:1px solid #ddd;">From</th>
              <th style="padding:6px; border:1px solid #ddd;">To</th>
              <th style="padding:6px; border:1px solid #ddd;">Days</th>
              <th style="padding:6px; border:1px solid #ddd;">Status</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>`;

  const file = await RNHTMLtoPDF.convert({ html, fileName: 'My_Leave_Report', base64: false });

  if (file.filePath) {
    await Share.share({ url: `file://${file.filePath}`, title: 'My Leave Report' });
  }
}
