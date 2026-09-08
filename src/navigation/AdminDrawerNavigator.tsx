import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AddEmployeeScreen from '../screens/admin/AddEmployeeScreen';
import EmployeeListScreen from '../screens/admin/EmployeeListScreen';
import AdminViewEmployeeDetailsScreen from '../screens/admin/AdminViewEmployeeDetailsScreen';
import AdminUpdateEmployeeScreen from '../screens/admin/AdminUpdateEmployeeScreen';
import AdminPendingOnboardingScreen from '../screens/admin/AdminPendingOnboardingScreen';
import AdminReviewOnboardingScreen from '../screens/admin/AdminReviewOnboardingScreen';
import AdminAttendanceScreen from '../screens/admin/AdminAttendanceScreen';
import AdminLeaveScreen from '../screens/admin/AdminLeaveScreen';
import AdminHourlyReportCardsScreen from '../screens/admin/AdminHourlyReportCardsScreen';
import AdminHourlyReportDetailScreen from '../screens/admin/AdminHourlyReportDetailScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import { colors } from '../theme/colors';

export type AdminDrawerParamList = {
  AdminDashboard: undefined;
  AdminAddEmployee: undefined;
  AdminEmployeeList: undefined;
  AdminViewEmployeeDetails: { employeeId: number };
  AdminUpdateEmployee: { employeeId: number };
  AdminPendingOnboarding: undefined;
  AdminReviewOnboarding: { employeeId: number };
  AdminAttendance: undefined;
  AdminLeave: undefined;
  AdminHourlyReportCards: undefined;
  AdminHourlyReportDetail: { employeeId: number };
  AdminNotifications: undefined;
  AdminSettings: undefined;
};

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

/** RN equivalent of the sidebar shared by every templates/admin/*.html. */
export default function AdminDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AdminSidebar {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.white, elevation: 0, shadowOpacity: 0 },
        headerShadowVisible: false,
        headerTitle: '',
        headerLeft: () => (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => navigation.openDrawer()}
            accessibilityLabel="Open sidebar"
          >
            <Feather name="menu" size={18} color={colors.bootstrapMuted} />
          </TouchableOpacity>
        ),
        drawerStyle: { width: '70%' },
        overlayColor: 'rgba(0,0,0,0.5)',
      })}
    >
      <Drawer.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Drawer.Screen name="AdminAddEmployee" component={AddEmployeeScreen} />
      <Drawer.Screen name="AdminEmployeeList" component={EmployeeListScreen} />
      <Drawer.Screen name="AdminViewEmployeeDetails" component={AdminViewEmployeeDetailsScreen} />
      <Drawer.Screen name="AdminUpdateEmployee" component={AdminUpdateEmployeeScreen} />
      <Drawer.Screen name="AdminPendingOnboarding" component={AdminPendingOnboardingScreen} />
      <Drawer.Screen name="AdminReviewOnboarding" component={AdminReviewOnboardingScreen} />
      <Drawer.Screen name="AdminAttendance" component={AdminAttendanceScreen} />
      <Drawer.Screen name="AdminLeave" component={AdminLeaveScreen} />
      <Drawer.Screen name="AdminHourlyReportCards" component={AdminHourlyReportCardsScreen} />
      <Drawer.Screen name="AdminHourlyReportDetail" component={AdminHourlyReportDetailScreen} />
      <Drawer.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
      <Drawer.Screen name="AdminSettings" component={AdminSettingsScreen} />
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
