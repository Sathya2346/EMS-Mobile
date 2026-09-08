import { DrawerContentComponentProps } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAdmin } from '../../context/AdminContext';
import { colors } from '../../theme/colors';
import { dashboardTypography } from '../../theme/typography';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  route: string | null;
}

// <nav class="nav flex-column mt-3"> in every templates/admin/*.html, same order.
const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: 'home', route: 'AdminDashboard' },
  { key: 'addEmployee', label: 'Add Employee', icon: 'user-plus', route: 'AdminAddEmployee' },
  { key: 'employeeList', label: 'Employee List', icon: 'user', route: 'AdminEmployeeList' },
  { key: 'pendingOnboarding', label: 'Pending Onboarding', icon: 'clipboard', route: 'AdminPendingOnboarding' },
  { key: 'attendance', label: 'Attendance', icon: 'clock', route: 'AdminAttendance' },
  { key: 'leave', label: 'Leave', icon: 'calendar', route: 'AdminLeave' },
  { key: 'hourlyReports', label: 'Hourly Reports', icon: 'list', route: 'AdminHourlyReportCards' },
  { key: 'notifications', label: 'Notifications', icon: 'bell', route: 'AdminNotifications' },
  { key: 'settings', label: 'Settings', icon: 'settings', route: 'AdminSettings' },
];

export default function AdminSidebar({ navigation, state }: DrawerContentComponentProps) {
  const { data } = useAdmin();
  const activeRouteName = state.routeNames[state.index];

  return (
    <View style={styles.sidebar}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.closeDrawer()}
        accessibilityLabel="Close sidebar"
      >
        <Feather name="x" size={18} color={colors.white} />
      </TouchableOpacity>

      <Text style={styles.heading}>EMS</Text>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.route === activeRouteName;
          const isDisabled = item.route === null;
          return (
            <TouchableOpacity
              key={item.key}
              disabled={isDisabled}
              onPress={() => item.route && navigation.navigate(item.route)}
              style={[
                styles.navLink,
                isActive && styles.navLinkActive,
                isDisabled && styles.navLinkDisabled,
              ]}
            >
              <Feather name={item.icon} size={17} color={colors.white} style={styles.navIcon} />
              <Text style={styles.navLabel}>{item.label}</Text>
              {item.key === 'notifications' && !!data?.adminUnreadCount && data.adminUnreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{data.adminUnreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.navLink} onPress={() => {}}>
          <Feather name="log-out" size={17} color={colors.white} style={styles.navIcon} />
          <Text style={styles.navLabel}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // .sidebar { background-color:#23d2aa; padding:15px 15px }
  sidebar: {
    flex: 1,
    backgroundColor: colors.sidebarBackground,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  closeButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  // .sidebar h4 { text-align:center; font-weight:700; margin-bottom:15px }
  heading: {
    ...dashboardTypography.sidebarHeading,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 15,
  },
  nav: {
    marginTop: 8,
  },
  // .sidebar .nav-link { padding:8px 12px; border-radius:8px; margin:2px 0; font-size:1rem }
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  // .sidebar .nav-link.active { background-color:#50d2b3 }
  navLinkActive: {
    backgroundColor: colors.sidebarHoverBackground,
  },
  navLinkDisabled: {
    opacity: 0.55,
  },
  navIcon: {
    marginRight: 10,
  },
  navLabel: {
    ...dashboardTypography.navLink,
    color: colors.white,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.dangerBadge,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
