import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AdminAttendanceRecord } from '../../api/adminAttendanceService';
import { colors } from '../../theme/colors';
import { format12HourTime, formatDuration } from '../../utils/attendanceTime';

const HEADERS = [
  'Date', 'Employee', 'Shift', 'Check-In', 'Break', 'Meeting', 'Idle Time', 'Check-Out', 'Total Hours', 'Remarks', 'Status',
];
const COLUMN_WIDTHS = [95, 120, 110, 90, 80, 80, 80, 90, 90, 130, 90];

function formatMinutes(mins: number | undefined | null): string {
  if (mins == null || mins < 0) return '--';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h === 0 ? `${m}m` : `${h}h ${m}m`;
}

function idleColor(idleMinutes: number): string {
  if (idleMinutes >= 60) return '#dc3545'; // bg-danger
  if (idleMinutes >= 30) return '#997404'; // bg-warning text-dark-ish
  return '#198754'; // bg-success
}

/** Port of `#attendanceTable`, populated via the Filter button's fetch handler. */
export default function AdminAttendanceTable({
  rows,
  placeholder,
}: {
  rows: AdminAttendanceRecord[] | null;
  placeholder: string;
}) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View style={styles.headerRow}>
            {HEADERS.map((h, i) => (
              <Text key={h} style={[styles.headerCell, { width: COLUMN_WIDTHS[i] }]}>
                {h}
              </Text>
            ))}
          </View>

          {!rows ? (
            <View style={styles.placeholderRow}>
              <Text style={styles.placeholderText}>{placeholder}</Text>
            </View>
          ) : rows.length === 0 ? (
            <View style={styles.placeholderRow}>
              <Text style={styles.placeholderText}>
                No attendance records found for this employee in the selected range.
              </Text>
            </View>
          ) : (
            rows.map((a, idx) => {
              const idleMinutes = a.idleTime || 0;
              const empName = a.employee
                ? `${a.employee.firstname || ''} ${a.employee.lastname || ''}`.trim()
                : a.username || '-';
              const shift = a.employee?.companyDetails?.shiftTiming || 'N/A';
              const remarks: string[] = [];
              if (a.lateIn || a.isLateIn) remarks.push(`Late (+${formatMinutes(a.lateMinutes)})`);
              if (a.earlyOut) remarks.push(`Early Leave (-${formatMinutes(a.earlyLeaveMinutes)})`);

              return (
                <View key={`${a.attendanceDate}-${idx}`} style={styles.dataRow}>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[0] }]}>{a.attendanceDate}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[1] }]}>{empName}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[2] }]}>{shift}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[3] }]}>
                    {format12HourTime(a.checkInTime)}
                  </Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[4] }]}>
                    {formatDuration(a.totalBreakTime || 0)}
                  </Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[5] }]}>
                    {formatMinutes(a.totalMeetingTime || 0)}
                  </Text>
                  <Text
                    style={[styles.cell, { width: COLUMN_WIDTHS[6], color: idleColor(idleMinutes), fontWeight: '700' }]}
                  >
                    {formatMinutes(idleMinutes)}
                  </Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[7] }]}>
                    {format12HourTime(a.checkOutTime)}
                  </Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[8] }]}>
                    {formatDuration(a.totalWorkTime || 0)}
                  </Text>
                  <View style={[styles.cell, { width: COLUMN_WIDTHS[9] }]}>
                    {remarks.length === 0 ? (
                      <Text style={styles.remarksDash}>-</Text>
                    ) : (
                      remarks.map((r) => (
                        <Text key={r} style={styles.remarksLine}>
                          {r}
                        </Text>
                      ))
                    )}
                  </View>
                  <Text
                    style={[
                      styles.cell,
                      { width: COLUMN_WIDTHS[10], fontWeight: '700' },
                      a.status === 'Present' ? styles.statusPresent : styles.statusOther,
                    ]}
                  >
                    {a.status || 'Working'}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
    padding: 8,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa', // table-light
  },
  headerCell: {
    padding: 10,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  cell: {
    padding: 10,
    textAlign: 'center',
    color: '#212529',
  },
  remarksDash: {
    textAlign: 'center',
    color: '#212529',
  },
  remarksLine: {
    textAlign: 'center',
    color: colors.alertDangerText,
    fontWeight: '700',
    fontSize: 12,
  },
  statusPresent: {
    color: '#198754',
  },
  statusOther: {
    color: colors.alertDangerText,
  },
  placeholderRow: {
    padding: 20,
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.bootstrapMuted,
    textAlign: 'center',
  },
});
