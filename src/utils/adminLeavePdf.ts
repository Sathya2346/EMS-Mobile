import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { AdminLeaveRecord } from '../api/adminLeaveService';

/**
 * Port of the jsPDF + autotable report in leave.js's `downloadPdfBtn`
 * handler: teal "Leave Report" title, "Employee: {name or All}" +
 * date-range line, then a 7-column table (Employee, Type, From, To, Days,
 * Approved By, Status).
 */
export async function exportAdminLeavePdf(
  employeeFilterName: string,
  from: string,
  to: string,
  leaves: AdminLeaveRecord[],
): Promise<void> {
  if (leaves.length === 0) {
    throw new Error('No leave records found for the selected filters.');
  }

  const tableRows = leaves
    .map((l, i) => {
      const name =
        l.employee?.firstname && l.employee?.lastname
          ? `${l.employee.firstname} ${l.employee.lastname}`
          : l.employeeName || '-';
      return `
      <tr style="background-color:${i % 2 === 1 ? '#eaf9f0' : '#ffffff'};">
        <td style="text-align:left;">${name}</td>
        <td>${l.leaveType || '-'}</td>
        <td>${l.leaveFromDate || '-'}</td>
        <td>${l.leaveToDate || '-'}</td>
        <td>${l.leaveDays ?? 0}</td>
        <td style="text-align:left;">${l.leaveApprovedBy || '-'}</td>
        <td>${l.leaveStatus || 'Pending'}</td>
      </tr>`;
    })
    .join('');

  const empText = employeeFilterName ? `Employee: ${employeeFilterName}` : 'Employee: All';

  const html = `
    <html>
      <body style="font-family: Helvetica, Arial, sans-serif; text-align:center;">
        <h2 style="color:#23d2aa; margin-bottom:4px;">Leave Report</h2>
        <p style="color:#666; margin:2px;">${empText}</p>
        <p style="color:#666; margin:2px 0 16px;">From: ${from}&nbsp;&nbsp;&nbsp;To: ${to}</p>
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background-color:#23d2aa; color:#ffffff;">
              <th style="padding:6px; border:1px solid #ddd;">Employee</th>
              <th style="padding:6px; border:1px solid #ddd;">Type</th>
              <th style="padding:6px; border:1px solid #ddd;">From</th>
              <th style="padding:6px; border:1px solid #ddd;">To</th>
              <th style="padding:6px; border:1px solid #ddd;">Days</th>
              <th style="padding:6px; border:1px solid #ddd;">Approved By</th>
              <th style="padding:6px; border:1px solid #ddd;">Status</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <p style="color:#666; font-size:10px; margin-top:16px; text-align:left;">
          Note: This report is system-generated and does not require a signature.
        </p>
      </body>
    </html>`;

  const safeName = employeeFilterName ? employeeFilterName.replace(/\s+/g, '_') : 'All';
  const file = await Print.printToFileAsync({
    html,
    fileName: `Leave_Report_${safeName}_${from}_to_${to}`,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('File sharing is not available on this device.');
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Leave Report',
  });
}
