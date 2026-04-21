import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Role, User } from '../types';
import { mockUsers } from '../data/mock/users';

interface AppContextValue {
  currentUser: User;
  role: Role;
  setRole: (role: Role) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('admin');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const currentUser = mockUsers.find(u => u.role === role) ?? mockUsers[0];

  const setRole = useCallback((r: Role) => setRoleState(r), []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser,
      role,
      setRole,
      sidebarCollapsed,
      setSidebarCollapsed,
      toasts,
      addToast,
      removeToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function usePermission(action: 'manage_engines' | 'manage_channels' | 'manage_settings' | 'view_analytics' | 'manage_team' | 'manage_billing') {
  const { role } = useApp();
  const permissions: Record<typeof action, Role[]> = {
    manage_engines: ['admin', 'manager'],
    manage_channels: ['admin', 'manager'],
    manage_settings: ['admin'],
    view_analytics: ['admin', 'manager', 'agent'],
    manage_team: ['admin'],
    manage_billing: ['admin'],
  };
  return permissions[action].includes(role);
}
