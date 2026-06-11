import React, { createContext, useContext, useState, useCallback } from 'react';
import { hashPin } from '../services/localStorageService';

const SESSION_KEY = 'impactiq:adminSession';

interface AuthContextValue {
  isAdmin: boolean;
  loginAdmin: (pin: string, storedHash: string) => Promise<boolean>;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // sessionStorage survives page refreshes but clears when the tab is closed
  const [isAdmin, setIsAdmin] = useState<boolean>(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  );

  const loginAdmin = useCallback(async (pin: string, storedHash: string): Promise<boolean> => {
    const inputHash = await hashPin(pin);
    if (inputHash === storedHash) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, loginAdmin, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
