import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AdminNotification } from '../../api/adminNotificationService';
import { colors } from '../../theme/colors';

const STATUS_COLOR: Record<string, string> = {
  approved: '#28a745',
  rejected: '#dc3545',
  pending: '#ffc107',
};

function iconFor(type: string): { name: string; color: string } {
  if (type === 'Leave' || type === 'Approved Leave' || type === 'Rejected Leave') {
    return { name: 'check-square', color: '#198754' }; // bi-calendar2-check-fill text-success
  }
  if (type === 'Onboarding') return { name: 'user-check', color: '#0d6efd' }; // text-primary
  if (type === 'HourlyReport') return { name: 'clipboard', color: '#ffc107' }; // text-warning
  if (type === 'Attendance') return { name: 'clock', color: '#0dcaf0' }; // text-info
  return { name: 'info', color: '#6c757d' }; // text-secondary
}

interface Props {
  notification: AdminNotification;
  onView: () => void;
}

/** Port of the per-type card markup built in `loadNotifications()` (notification.js). */
export default function AdminNotificationCard({ notification, onView }: Props) {
  const { type, readStatus } = notification;
  const icon = iconFor(type);
  const isLeave = type === 'Leave' || type === 'Approved Leave' || type === 'Rejected Leave';

  return (
    <View style={[styles.card, !readStatus && styles.cardUnread]}>
      <View style={styles.infoRow}>
        <Feather name={icon.name} size={22} color={icon.color} style={styles.icon} />
        <View style={styles.textWrap}>
          {isLeave ? (
            <>
              <Text style={styles.line}>
                <Text style={styles.bold}>{notification.employeeName || 'Employee'}</Text> applied for{' '}
                <Text style={styles.bold}>{notification.leaveType || 'Leave'}</Text>
              </Text>
              <View style={styles.smallRow}>
                <Text style={styles.small}>
                  {notification.leaveFromDate || '-'} to {notification.leaveToDate || '-'} | Status:{' '}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        STATUS_COLOR[(notification.leaveStatus || 'pending').toLowerCase()] || STATUS_COLOR.pending,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      (notification.leaveStatus || '').toLowerCase() === 'pending' && styles.statusPillTextDark,
                    ]}
                  >
                    {notification.leaveStatus || 'Pending'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.line}>
                <Text style={styles.bold}>
                  {notification.title ||
                    (type === 'Onboarding'
                      ? 'Onboarding Submitted'
                      : type === 'HourlyReport'
                      ? 'Hourly Reports'
                      : type === 'Attendance'
                      ? 'Attendance Alert'
                      : 'Notification')}
                </Text>
              </Text>
              <Text style={styles.small}>{notification.message || ''}</Text>
            </>
          )}
        </View>
      </View>

      {!readStatus && (
        <TouchableOpacity style={styles.viewBtn} onPress={onView}>
          <Text style={styles.viewBtnText}>view</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // .notification-card { background:#f8f9fa; border-radius:10px; padding:15px 20px; margin-bottom:12px; border-left:4px solid transparent }
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  // .notification-card.unread { background:#f0fbf8; border-left:4px solid #23d2aa }
  cardUnread: {
    backgroundColor: '#f0fbf8',
    borderLeftColor: colors.attendanceBtnGreen,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  line: {
    fontWeight: '500',
    color: '#212529',
    fontSize: 14,
  },
  bold: {
    fontWeight: '700',
  },
  smallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 3,
  },
  small: {
    color: '#666666',
    fontSize: 12.5,
  },
  statusPill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  statusPillText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 12,
  },
  statusPillTextDark: {
    color: '#000000',
  },
  // .btn-view { background:#23d2aa; border-radius:5px; padding:5px 12px }
  viewBtn: {
    backgroundColor: colors.attendanceBtnGreen,
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 10,
  },
  viewBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
});
