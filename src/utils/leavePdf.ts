import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LeaveRecord } from '../api/leaveService';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export async function exportLeavePdf(employeeName: string, leaves: LeaveRecord[]): Promise<void> {
  if (leaves.length === 0) {
    throw new Error('No leave records found for the selected period. Cannot download an empty report.');
  }

  const tableRows = leaves.map((l, i) => `
    <tr style="background-color:${i % 2 === 1 ? '#eaf9f0' : '#ffffff'};">
      <td>${escapeHtml(l.leaveType)}</td><td>${escapeHtml(l.leaveFromDate)}</td>
      <td>${escapeHtml(l.leaveToDate)}</td><td>${escapeHtml(l.leaveDays)}</td>
      <td>${escapeHtml(l.leaveStatus)}</td>
    </tr>`).join('');

  const html = `<!doctype html><html><body style="font-family:Helvetica,Arial,sans-serif;text-align:center;">
    <h2 style="color:#23d2aa;margin-bottom:4px;">My Leave Report</h2>
    <p style="color:#666;margin:2px;">Employee: ${escapeHtml(employeeName || 'Employee')}</p>
    <p style="color:#666;margin:2px 0 16px;">Generated: ${escapeHtml(new Date().toLocaleDateString())}</p>
    <table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background-color:#23d2aa;color:#fff;">
      <th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th>
    </tr></thead><tbody>${tableRows}</tbody></table></body></html>`;

  const file = await Print.printToFileAsync({ html });
  if (file.uri && await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: 'My Leave Report' });
  }
}
