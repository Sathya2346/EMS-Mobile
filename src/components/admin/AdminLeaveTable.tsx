import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AdminLeaveRecord } from '../../api/adminLeaveService';
import LeaveStatusPill from '../user/LeaveStatusPill';
import { colors } from '../../theme/colors';

const HEADERS = ['Name', 'Leave Type', 'From', 'To', 'Days', 'Approved By', 'Status', 'Action'];
const COLUMN_WIDTHS = [130, 110, 100, 100, 60, 120, 110, 130];

interface Props {
  leaves: AdminLeaveRecord[];
  loading: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}

function employeeName(leave: AdminLeaveRecord): string {
  if (leave.employee?.firstname && leave.employee?.lastname) {
    return `${leave.employee.firstname} ${leave.employee.lastname}`;
  }
  return leave.employeeName || '-';
}

/** Port of `#leaveTableBody` populated by `populateLeaveTable()` in leave.js. */
export default function AdminLeaveTable({ leaves, loading, onApprove, onReject, onDelete }: Props) {
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

          {loading ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>Loading leave data...</Text>
            </View>
          ) : leaves.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          ) : (
            leaves.map((leave) => {
              const status = leave.leaveStatus || 'Pending';
              return (
                <View key={leave.id} style={styles.dataRow}>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[0] }]}>{employeeName(leave)}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[1] }]}>{leave.leaveType || '-'}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[2] }]}>{leave.leaveFromDate || '-'}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[3] }]}>{leave.leaveToDate || '-'}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[4] }]}>{leave.leaveDays ?? 0}</Text>
                  <Text style={[styles.cell, { width: COLUMN_WIDTHS[5] }]}>{leave.leaveApprovedBy || 'Manager'}</Text>
                  <View style={[styles.cell, { width: COLUMN_WIDTHS[6] }]}>
                    <LeaveStatusPill status={status} />
                  </View>
                  <View style={[styles.actionCell, { width: COLUMN_WIDTHS[7] }]}>
                    {status === 'Pending' && (
                      <>
                        <TouchableOpacity onPress={() => onApprove(leave.id)} accessibilityLabel="Approve">
                          <Feather name="check-circle" size={18} color="#198754" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onReject(leave.id)} accessibilityLabel="Reject">
                          <Feather name="x-circle" size={18} color="#dc3545" />
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity onPress={() => onDelete(leave.id)} accessibilityLabel="Delete">
                      <Feather name="trash-2" size={18} color="#6c757d" />
                    </TouchableOpacity>
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
  container: {
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
    padding: 8,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
  },
  headerCell: {
    padding: 10,
    fontWeight: '600',
    color: '#212529',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  cell: {
    padding: 10,
    justifyContent: 'center',
  },
  actionCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 10,
  },
  emptyRow: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.bootstrapMuted,
  },
});
