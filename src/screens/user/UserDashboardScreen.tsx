import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getActivityStatus } from '../../api/employeeService';
import { useEmployee } from '../../context/EmployeeContext';
import { colors } from '../../theme/colors';
import { dashboardTypography } from '../../theme/typography';

const ACTIVITY_BADGE_COLOR: Record<string, string> = {
  Working: '#198754', // bg-success
  Break: '#ffc107', // bg-warning
  'On Break': '#ffc107',
  Meeting: colors.purple, // bg-purple
  'In Meeting': colors.purple,
  Leave: '#0d6efd', // bg-primary
  Absent: '#dc3545', // bg-danger
};
const DEFAULT_BADGE_COLOR = '#6c757d'; // bg-secondary

/**
 * Exact port of templates/user/userDashboard.html main-content section
 * (the sidebar itself lives in UserSidebar.tsx / UserDrawerNavigator.tsx).
 */
export default function UserDashboardScreen() {
  const { data, loading, error, reload } = useEmployee();
  const [activityStatus, setActivityStatus] = useState<string | undefined>(
    data?.employee.activityStatus,
  );

  // th:inline="javascript" polling block: setInterval(updateDashboardBadge, 2000)
  useEffect(() => {
    if (!data) return;
    setActivityStatus(data.employee.activityStatus);
    const poll = async () => {
      try {
        const result = await getActivityStatus(data.employee.id);
        setActivityStatus(result.activityStatus);
      } catch {
        // original script silently swallows fetch errors (empty catch(e){})
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [data]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.sidebarBackground} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Unable to load dashboard.'}</Text>
      </View>
    );
  }

  const { employee, pendingCompanyDetails } = data;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={undefined}
    >
      {/* <div class="row my-3"><h1>Welcome ...</h1></div> */}
      <Text style={styles.pageTitle}>
        Welcome {employee.firstname} {employee.lastname}
      </Text>

      {/* Pending Company Details Notice Card */}
      {pendingCompanyDetails && (
        <View style={styles.noticeCard}>
          <View style={styles.noticeRow}>
            <Feather
              name="alert-triangle"
              size={40}
              color={colors.bootstrapWarningIcon}
              style={styles.noticeIcon}
            />
            <View style={styles.noticeTextWrap}>
              <Text style={styles.noticeHeading}>
                Profile Approved - Pending Admin Assignment
              </Text>
              <Text style={styles.noticeBody}>
                Congratulations! Your onboarding documents have been fully
                approved. Please wait for the Administrator to assign your
                company details (Designation, Shift Timing, and Joining
                Date). Once assigned, you will automatically receive full
                access to EMS modules such as Attendance, Leave, and Hourly
                Reports.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* <div class="row"><div class="card shadow p-4 text-center"> */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Image
            source={
              employee.profileImageSrc
                ? { uri: employee.profileImageSrc }
                : require('../../assets/images/default-avatar.png')
            }
            style={styles.avatar}
          />
          {employee.overallStatus === 'FULLY_APPROVED' && (
            <View
              style={[
                styles.activityBadge,
                {
                  backgroundColor:
                    ACTIVITY_BADGE_COLOR[activityStatus || ''] || DEFAULT_BADGE_COLOR,
                },
              ]}
            />
          )}
        </View>

        <Text style={styles.employeeName}>
          {employee.firstname} {employee.lastname}
        </Text>

        <Text style={[styles.infoLine, styles.muted]}>
          <Text style={styles.bold}>Employee ID: </Text>
          {employee.id}
        </Text>
        <Text style={styles.infoLine}>
          <Text style={styles.bold}>Email: </Text>
          {employee.email}
        </Text>
        <Text style={styles.infoLine}>
          <Text style={styles.bold}>Designation: </Text>
          {employee.companyDetails?.designation ?? 'N/A'}
        </Text>
        <Text style={styles.infoLine}>
          <Text style={styles.bold}>Role: </Text>
          {employee.userType === 'ROLE_USER'
            ? 'Employee'
            : employee.userType === 'ROLE_ADMIN'
            ? 'Administrator'
            : employee.userType}
        </Text>
        <Text style={styles.infoLine}>
          <Text style={styles.bold}>Shift: </Text>
          {employee.companyDetails?.shiftTiming ?? 'N/A'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // .main-content { background:#fff; min-height:100vh; } mobile padding: 15px
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: 15,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    ...dashboardTypography.body,
    color: colors.alertDangerText,
    textAlign: 'center',
  },
  // Bootstrap h1 default, .my-3 = margin: 1rem 0
  pageTitle: {
    ...dashboardTypography.pageTitle,
    color: '#212529',
    marginVertical: 16,
  },
  // .alert.alert-warning.shadow.p-4.mb-4 { border-radius:15px; border-left:6px solid #ffc107; background: rgba(255,193,7,.05) }
  noticeCard: {
    borderRadius: 15,
    borderLeftWidth: 6,
    borderLeftColor: colors.alertWarningBorder,
    backgroundColor: colors.alertWarningBg,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeIcon: {
    marginRight: 12,
  },
  noticeTextWrap: {
    flex: 1,
  },
  // h4.alert-heading.fw-bold.mb-1 style="color:#856404"
  noticeHeading: {
    ...dashboardTypography.cardName,
    fontWeight: '700',
    color: colors.alertWarningHeading,
    marginBottom: 4,
  },
  // p.mb-0.text-muted style="font-size:.95rem"
  noticeBody: {
    ...dashboardTypography.body,
    fontSize: 15.2,
    color: colors.bootstrapMuted,
  },
  // .card.shadow.p-4.text-center { border-radius:.375rem }
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.125)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  // .position-relative.mx-auto.mb-3 { width:120px; height:120px }
  avatarWrap: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  // img.rounded-circle.w-100.h-100.shadow-sm { border:4px solid #1abc9c; object-fit:cover }
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#1abc9c',
  },
  // .activity-badge-large { width:20px; height:20px; border-radius:50%; border:3px solid #fff; position:absolute; bottom:2px; right:2px }
  activityBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.white,
  },
  // <h3> (Bootstrap default font-weight: 500)
  employeeName: {
    ...dashboardTypography.sectionTitle,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 8,
  },
  // <p> default margin-bottom: 1rem
  infoLine: {
    ...dashboardTypography.body,
    color: '#212529',
    marginBottom: 16,
  },
  muted: {
    color: colors.bootstrapMuted,
  },
  bold: {
    fontWeight: '700',
  },
});
