import React, { createContext, useContext, useState } from 'react';

interface SessionContextValue {
  employeeId: number | null;
  userType: string | null;
  signIn: (employeeId: number, userType: string) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  return (
    <SessionContext.Provider
      value={{
        employeeId,
        userType,
        signIn: (id, type) => {
          setEmployeeId(id);
          setUserType(type);
        },
        signOut: () => {
          setEmployeeId(null);
          setUserType(null);
        },
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
