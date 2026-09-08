import React from 'react';
import { AdminProvider } from '../context/AdminContext';
import { EmployeeProvider } from '../context/EmployeeContext';
import { useSession } from '../context/SessionContext';
import AdminDrawerNavigator from './AdminDrawerNavigator';
import AuthNavigator from './AuthNavigator';
import UserDrawerNavigator from './UserDrawerNavigator';

/**
 * Not itself derived from a single Thymeleaf template — this is the RN app
 * shell that decides which stack to mount, standing in for Spring
 * Security's server-side redirect between /login, /user/userDashboard/{id}
 * and /admin/dashboard depending on the authenticated user's role.
 */
export default function RootNavigator() {
  const { employeeId, userType } = useSession();

  if (employeeId == null) {
    return <AuthNavigator />;
  }

  if (userType === 'ADMIN') {
    return (
      <AdminProvider>
        <AdminDrawerNavigator />
      </AdminProvider>
    );
  }

  return (
    <EmployeeProvider employeeId={employeeId}>
      <UserDrawerNavigator />
    </EmployeeProvider>
  );
}
