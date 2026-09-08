import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getUserDashboardData, UserDashboardData } from '../api/employeeService';

interface EmployeeContextValue {
  data: UserDashboardData | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const EmployeeContext = createContext<EmployeeContextValue | undefined>(undefined);

/**
 * Wraps the authenticated (post-login) part of the app. `employeeId` comes
 * from the logged-in session, matching how every user/*.html template
 * receives `${employee.id}` from the server-side session/model.
 */
export function EmployeeProvider({
  employeeId,
  children,
}: {
  employeeId: number;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getUserDashboardData(employeeId)
      .then(setData)
      .catch((e) => setError(e.message || 'Failed to load employee data.'))
      .finally(() => setLoading(false));
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <EmployeeContext.Provider value={{ data, loading, error, reload: load }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return ctx;
}
