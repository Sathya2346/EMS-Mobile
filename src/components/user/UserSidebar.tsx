import { DrawerContentComponentProps } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useEmployee } from '../../context/EmployeeContext';
import { colors } from '../../theme/colors';
import { dashboardTypography } from '../../theme/typography';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  /** Route name in UserDrawerNavigator, or null if not built in this batch yet */
  route: string | null;
}

// <nav class="nav flex-column mt-3"> ... </nav> in every user/*.html template,
// in the exact same order. Icon mapping: Bootstrap Icons -> Feather (see
// README "Icons" section); bi-clock-history has no direct Feather glyph, so
// the closest available "history" icon (rotate-ccw) is used instead.
const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: 'home', route: 'UserDashboard' },
  { key: 'profile', label: 'Profile', icon: 'user', route: 'UserProfile' },
  { key: 'attendance', label: 'Attendance', icon: 'clock', route: 'UserAttendance' },
  { key: 'leave', label: 'Leave', icon: 'calendar', route: 'UserLeave' },
  { key: 'hourlyReport', label: 'Hourly Report', icon: 'rotate-ccw', route: 'UserHourlyReport' },
  { key: 'notification', label: 'Notification', icon: 'bell', route: 'UserNotification' },
];

export default function UserSidebar({ navigation, state }: DrawerContentComponentProps) {
  const { data } = useEmployee();
  const activeRouteName = state.routeNames[state.index];

  return (
    <View style={styles.sidebar}>
      {/* <button id="closeSidebar"><i class="bi bi-x-lg"></i></button> — only
          shown on medium/narrow widths (d-md-block d-lg-none) in the source;
          on a phone-width RN app that condition is always true. */}
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
              <Feather
                name={item.icon}
                size={18}
                color={colors.white}
                style={styles.navIcon}
              />
              <Text style={styles.navLabel}>{item.label}</Text>
              {item.key === 'notification' &&
                !!data?.userUnreadCount &&
                data.userUnreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{data.userUnreadCount}</Text>
                  </View>
                )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.navLink} onPress={() => {}}>
          <Feather name="log-out" size={18} color={colors.white} style={styles.navIcon} />
          <Text style={styles.navLabel}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // .sidebar { background-color: #23d2aa; padding: 20px 20px; }
  sidebar: {
    flex: 1,
    backgroundColor: colors.sidebarBackground,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  // .sidebar h4 { text-align: center; font-weight: 700; margin-bottom: 25px; }
  heading: {
    ...dashboardTypography.sidebarHeading,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 25,
  },
  nav: {
    marginTop: 12,
  },
  // .sidebar .nav-link { padding: 12px 15px; border-radius: 8px; margin: 3px 0; }
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 3,
  },
  // .sidebar .nav-link.active { background-color: #50d2b3 } (bg-secondary
  // rounded is overridden visually since .active is more specific here)
  navLinkActive: {
    backgroundColor: colors.sidebarHoverBackground,
  },
  // .sidebar .nav-link.disabled-link { opacity: 0.55; cursor: not-allowed }
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
  // .badge.bg-danger.ms-1
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
