import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AdminDashboardData, getAdminDashboard } from '../api/adminService';

interface AdminContextValue {
  data: AdminDashboardData | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminDashboard()
      .then(setData)
      .catch((e) => setError(e.message || 'Failed to load admin data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminContext.Provider value={{ data, loading, error, reload: load }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return ctx;
}
