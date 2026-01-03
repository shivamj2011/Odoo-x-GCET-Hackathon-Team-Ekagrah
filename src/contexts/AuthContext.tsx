import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types/hrms';
import { validateCredentials } from '@/lib/employeeStorage';

interface AuthContextType {
  user: User | null;
  loginWithCredentials: (loginId: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loginWithCredentials = (loginId: string, password: string) => {
    const result = validateCredentials(loginId, password);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithCredentials, logout, isAuthenticated: !!user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
