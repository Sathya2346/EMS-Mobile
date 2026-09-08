import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import UserSidebar from '../components/user/UserSidebar';
import UserDashboardScreen from '../screens/user/UserDashboardScreen';
import OnboardingFormScreen from '../screens/user/OnboardingFormScreen';
import UserAttendanceScreen from '../screens/user/UserAttendanceScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';
import UserLeaveScreen from '../screens/user/UserLeaveScreen';
import UserHourlyReportScreen from '../screens/user/UserHourlyReportScreen';
import UserNotificationScreen from '../screens/user/UserNotificationScreen';
import { useEmployee } from '../context/EmployeeContext';
import { colors } from '../theme/colors';

export type UserDrawerParamList = {
  UserDashboard: undefined;
  OnboardingForm: undefined;
  UserProfile: undefined;
  UserAttendance: undefined;
  UserLeave: undefined;
  UserHourlyReport: undefined;
  UserNotification: undefined;
};

const Drawer = createDrawerNavigator<UserDrawerParamList>();

/**
 * RN equivalent of the sidebar in every user/*.html template:
 * `.sidebar { position: fixed; left: -100%; ... }` sliding to `left: 0`
 * when `#sidebarToggle` is clicked, and back on `#closeSidebar`. A
 * navigation Drawer reproduces exactly that slide-in-over-content behavior,
 * with UserSidebar (the drawerContent) as a 1:1 port of the `.sidebar` markup.
 */
export default function UserDrawerNavigator() {
  const { data } = useEmployee();
  // Matches the backend's own redirect logic: an employee whose onboarding
  // isn't FULLY_APPROVED yet lands on the onboarding form first, not the
  // (mostly-empty/pending) dashboard.
  const initialRouteName =
    data && data.employee.overallStatus !== 'FULLY_APPROVED' ? 'OnboardingForm' : 'UserDashboard';

  return (
    <Drawer.Navigator
      initialRouteName={initialRouteName}
      drawerContent={(props) => <UserSidebar {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.white, elevation: 0, shadowOpacity: 0 },
        headerShadowVisible: false,
        headerTitle: '',
        // <button id="sidebarToggle" class="btn btn-outline-secondary d-lg-none"><i class="bi bi-list"></i></button>
        headerLeft: () => (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => navigation.openDrawer()}
            accessibilityLabel="Open sidebar"
          >
            <Feather name="menu" size={18} color={colors.bootstrapMuted} />
          </TouchableOpacity>
        ),
        drawerStyle: { width: '70%' }, // .sidebar { width: 70% } @media (max-width: 992px)
        overlayColor: 'rgba(0,0,0,0.5)',
      })}
    >
      <Drawer.Screen name="UserDashboard" component={UserDashboardScreen} />
      <Drawer.Screen name="OnboardingForm" component={OnboardingFormScreen} />
      <Drawer.Screen name="UserProfile" component={UserProfileScreen} />
      <Drawer.Screen name="UserAttendance" component={UserAttendanceScreen} />
      <Drawer.Screen name="UserLeave" component={UserLeaveScreen} />
      <Drawer.Screen name="UserHourlyReport" component={UserHourlyReportScreen} />
      <Drawer.Screen name="UserNotification" component={UserNotificationScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    marginLeft: 15,
    borderWidth: 1,
    borderColor: colors.bootstrapMuted,
    borderRadius: 6,
    padding: 8,
  },
});
