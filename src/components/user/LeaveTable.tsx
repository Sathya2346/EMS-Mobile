import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { LeaveRecord } from '../../api/leaveService';
import { colors } from '../../theme/colors';
import LeaveStatusPill from './LeaveStatusPill';

const COLUMN_WIDTHS = [120, 110, 100, 100, 60, 120, 110, 110];
const HEADERS = ['Name', 'Leave Type', 'From', 'To', 'Days', 'Approved By', 'Status', 'Action'];

interface Props {
  leaves: LeaveRecord[];
  onCancel: (leaveId: number) => void;
}

// Port of the `<table class="table table-borderless align-middle">` in userLeave.html
export default function LeaveTable({ leaves, onCancel }: Props) {
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

          {leaves.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No leave records found for this employee.</Text>
            </View>
          ) : (
            leaves.map((leave) => {
              const canCancel = leave.leaveStatus === 'Pending' || leave.leaveStatus === 'Approved';
              return (
                <View key={leave.id} style={styles.dataRow}>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[0] }]}>{leave.employeeName}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[1] }]}>{leave.leaveType}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[2] }]}>{leave.leaveFromDate}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[3] }]}>{leave.leaveToDate}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[4] }]}>{leave.leaveDays}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[5] }]}>
                    {leave.leaveApprovedBy || '-'}
                  </Text>
                  <View style={[styles.cell, { width: COLUMN_WIDTHS[6] }]}>
                    <LeaveStatusPill status={leave.leaveStatus} />
                  </View>
                  <View style={[styles.cell, { width: COLUMN_WIDTHS[7] }]}>
                    {canCancel ? (
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => onCancel(leave.id)}
                      >
                        <Feather name="trash-2" size={13} color={colors.alertDangerText} />
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.dash}>-</Text>
                    )}
                  </View>
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
  // .table-container { background:#fff; border-radius:6px; padding:15px }
  container: {
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: 15,
    marginTop: 12,
  },
  // th { background-color:#adf0da; font-weight:600 }
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.tableHeaderBg,
  },
  headerCell: {
    padding: 10,
    fontWeight: '600',
    color: '#000000',
  },
  // td { background-color:#a4cdc0 }
  dataRow: {
    flexDirection: 'row',
    backgroundColor: colors.leaveTableRow,
    borderTopWidth: 1,
    borderTopColor: colors.white,
  },
  cell: {
    padding: 10,
    justifyContent: 'center',
  },
  // .btn.btn-sm.btn-outline-danger.cancel-btn
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.alertDangerText,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  cancelBtnText: {
    color: colors.alertDangerText,
    fontWeight: '500',
    fontSize: 12,
  },
  dash: {
    color: colors.bootstrapMuted,
  },
  emptyRow: {
    padding: 16,
  },
  emptyText: {
    color: colors.alertDangerText,
  },
});
