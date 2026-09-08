import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { EmployeeListItem } from '../../api/adminEmployeeService';
import { colors } from '../../theme/colors';
import { safeNavigate } from '../../utils/safeNavigate';

const ACTIVITY_BADGE_COLOR: Record<string, string> = {
  Working: '#198754',
  Break: '#ffc107',
  'On Break': '#ffc107',
  Meeting: colors.purple,
  'In Meeting': colors.purple,
  Leave: '#0d6efd',
  Absent: '#dc3545',
};
const DEFAULT_BADGE_COLOR = '#6c757d';

function formatHiredDate(iso: string | null): string {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}

export default function EmployeeCard({ employee }: { employee: EmployeeListItem }) {
  const navigation = useNavigation<any>();
  const isFullyApproved = employee.overallStatus === 'FULLY_APPROVED';
  const statusLabel = !isFullyApproved
    ? 'Pending Onboarding'
    : employee.companyDetails?.status || 'N/A';
  const statusVariant = !isFullyApproved
    ? 'pending'
    : employee.companyDetails?.status === 'Active'
    ? 'active'
    : 'inactive';

  const statusStyle =
    statusVariant === 'active'
      ? styles.status_active
      : statusVariant === 'inactive'
      ? styles.status_inactive
      : styles.status_pending;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.editIcon}
        onPress={() => safeNavigate(navigation, 'AdminUpdateEmployee', { employeeId: employee.id })}
      >
        <Feather name="edit-2" size={16} color="#666666" />
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <View style={styles.avatarWrap}>
          <Image
            source={
              employee.profileImageSrc
                ? { uri: employee.profileImageSrc }
                : require('../../assets/images/default-avatar.png')
            }
            style={styles.avatar}
          />
          {isFullyApproved && (
            <View
              style={[
                styles.activityBadge,
                { backgroundColor: ACTIVITY_BADGE_COLOR[employee.activityStatus] || DEFAULT_BADGE_COLOR },
              ]}
            />
          )}
        </View>
        <View style={styles.nameWrap}>
          <Text style={styles.name}>
            {employee.firstname} {employee.lastname}
          </Text>
          <Text style={styles.designation}>{employee.companyDetails?.designation || 'N/A'}</Text>
        </View>
      </View>

      <View style={[styles.statusPill, statusStyle]}>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.hiredLabel}>Hired Date</Text>
        <Text style={styles.hiredValue}>
          {formatHiredDate(employee.companyDetails?.joiningDate || null)}
        </Text>

        <View style={styles.contactRow}>
          <Feather name="mail" size={13} color="#495057" />
          <Text style={styles.contactText}>{employee.email}</Text>
        </View>
        <View style={styles.contactRow}>
          <Feather name="phone" size={13} color="#495057" />
          <Text style={styles.contactText}>{employee.phone || 'N/A'}</Text>
        </View>

        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => safeNavigate(navigation, 'AdminViewEmployeeDetails', { employeeId: employee.id })}
        >
          <Text style={styles.viewBtnText}>View More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f7fdfb',
    padding: 18,
    borderRadius: 12,
  },
  editIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 55,
    height: 55,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  activityBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 2,
    borderColor: colors.white,
  },
  nameWrap: {
    flexShrink: 1,
  },
  name: {
    fontWeight: '700',
    fontSize: 15,
    color: '#212529',
  },
  designation: {
    color: '#6c757d',
    fontSize: 12.5,
    marginTop: 2,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  status_active: {
    backgroundColor: '#23d2aa',
  },
  status_inactive: {
    backgroundColor: '#8B8B8B',
  },
  status_pending: {
    backgroundColor: '#ffbb00',
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
  },
  cardBody: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
    marginVertical: 12,
  },
  hiredLabel: {
    fontWeight: '700',
    fontSize: 13,
    color: '#212529',
    marginTop: 12,
  },
  hiredValue: {
    fontSize: 13,
    color: '#212529',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  contactText: {
    fontSize: 13,
    color: '#212529',
  },
  viewBtn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.attendanceBtnOrange,
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  viewBtnText: {
    color: colors.white,
    fontSize: 13,
  },
});
