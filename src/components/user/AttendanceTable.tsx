import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import StatusBadge from './StatusBadge';

export interface AttendanceRow {
  date: string;
  shift: string;
  checkIn: string;
  checkOut: string;
  meeting: string;
  remarks: string;
  status: string;
}

const COLUMN_WIDTHS = [100, 130, 90, 90, 90, 140, 120];
const HEADERS = ['Date', 'Shift', 'Check-In', 'Check-Out', 'Meeting', 'Remarks', 'Status'];

/**
 * Port of `#attendanceTable` (th background #adf0da, borderless rows,
 * centered text, remarks in bold red). Wrapped in a horizontal ScrollView
 * since the original relies on `.table-container { overflow-x:auto }` for
 * the same reason — 7 columns don't fit a phone width.
 */
export default function AttendanceTable({ rows }: { rows: AttendanceRow[] }) {
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

          {rows.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No attendance data found</Text>
            </View>
          ) : (
            rows.map((row, idx) => (
              <View key={`${row.date}-${idx}`} style={styles.dataRow}>
                <Text style={[styles.cell, { width: COLUMN_WIDTHS[0] }]}>{row.date}</Text>
                <Text style={[styles.cell, { width: COLUMN_WIDTHS[1] }]}>{row.shift}</Text>
                <Text style={[styles.cell, { width: COLUMN_WIDTHS[2] }]}>{row.checkIn}</Text>
                <Text style={[styles.cell, { width: COLUMN_WIDTHS[3] }]}>{row.checkOut}</Text>
                <Text style={[styles.cell, { width: COLUMN_WIDTHS[4] }]}>{row.meeting}</Text>
                <Text style={[styles.cell, styles.remarks, { width: COLUMN_WIDTHS[5] }]}>
                  {row.remarks}
                </Text>
                <View style={[styles.cell, { width: COLUMN_WIDTHS[6], alignItems: 'center' }]}>
                  <StatusBadge status={row.status} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // .table-container { margin-top:25px; background:#fff; border-radius:6px; padding:15px }
  container: {
    marginTop: 25,
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
    padding: 15,
  },
  // th { background-color:#adf0da; font-weight:600 }
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.tableHeaderBg,
  },
  headerCell: {
    padding: 12,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  cell: {
    padding: 12,
    textAlign: 'center',
    color: '#212529',
  },
  // .text-danger.fw-bold on the remarks cell
  remarks: {
    color: colors.alertDangerText,
    fontWeight: '700',
  },
  emptyRow: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.bootstrapMuted,
  },
});
