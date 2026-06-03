import { useState, useCallback } from 'react';
import type { User } from '@/types';

const DEMO_USER: User = {
  id: '1',
  email: 'dev@yemengateway.dev',
  name: 'Yemen Developer',
  company: 'Yemen Tech Solutions',
  role: 'developer',
  plan: 'starter',
  createdAt: '2024-01-15',
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(DEMO_USER);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (_email: string, _password: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(DEMO_USER);
    setIsLoading(false);
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ ...DEMO_USER, name, email });
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
  };
}
