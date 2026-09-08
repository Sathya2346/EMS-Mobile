import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Share } from 'react-native';
import { HourlyReportRow } from '../api/adminHourlyReportService';

/**
 * Port of the jsPDF + autotable report in adminHourlyReports.js's
 * `downloadPdfBtn` handler: teal "Hourly Work Report" title, "Employee:
 * {name}" line, then a 4-column table (Time Slot, Task Description,
 * Status, Date) — read straight from the already-rendered table rows in
 * the source; reproduced here from the same `rows` the table renders.
 */
export async function exportAdminHourlyReportPdf(employeeName: string, rows: HourlyReportRow[]): Promise<void> {
  if (rows.length === 0) {
    throw new Error('No reports to export.');
  }

  const tableRows = rows
    .map(
      (r, i) => `
      <tr style="background-color:${i % 2 === 1 ? '#eaf9f0' : '#ffffff'};">
        <td>${r.timeSlot || '-'}</td>
        <td style="text-align:left;">${r.taskDescription || '-'}</td>
        <td>${r.status || '-'}</td>
        <td>${r.createdAt || '-'}</td>
      </tr>`,
    )
    .join('');

  const html = `
    <html>
      <body style="font-family: Helvetica, Arial, sans-serif; text-align:center;">
        <h2 style="color:#23d2aa; margin-bottom:4px;">Hourly Work Report</h2>
        <p style="color:#666; margin:2px 0 16px;">Employee: ${employeeName || 'Employee'}</p>
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background-color:#23d2aa; color:#ffffff;">
              <th style="padding:6px; border:1px solid #ddd;">Time Slot</th>
              <th style="padding:6px; border:1px solid #ddd;">Task Description</th>
              <th style="padding:6px; border:1px solid #ddd;">Status</th>
              <th style="padding:6px; border:1px solid #ddd;">Date</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>`;

  const file = await RNHTMLtoPDF.convert({ html, fileName: `Hourly_Report_${employeeName}`, base64: false });

  if (file.filePath) {
    await Share.share({ url: `file://${file.filePath}`, title: 'Hourly Work Report' });
  }
}
