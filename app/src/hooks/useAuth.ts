import { useState, useCallback, useEffect } from 'react';
import type { User } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'https://yemen-gateway-api.onrender.com';

type BackendUser = {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: 'developer' | 'admin';
  plan_id?: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
};

type AuthResponse = {
  success: boolean;
  data?: {
    token: string;
    refresh_token?: string;
    user: BackendUser;
    expires_at: string;
  };
  error?: string;
};

function normalizeUser(user: BackendUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    company: user.company,
    role: user.role,
    plan: 'free',
    createdAt: user.created_at,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('yg_user');
    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser) as User;
    } catch {
      localStorage.removeItem('yg_user');
      localStorage.removeItem('yg_token');
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const saveSession = useCallback((token: string, backendUser: BackendUser) => {
    const normalized = normalizeUser(backendUser);

    localStorage.setItem('yg_token', token);
    localStorage.setItem('yg_user', JSON.stringify(normalized));

    setUser(normalized);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('yg_token');
    localStorage.removeItem('yg_user');
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result: AuthResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || 'فشل تسجيل الدخول');
      }

      saveSession(result.data.token, result.data.user);
    } finally {
      setIsLoading(false);
    }
  }, [saveSession]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          company: '',
        }),
      });

      const result: AuthResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || 'فشل إنشاء الحساب');
      }

      saveSession(result.data.token, result.data.user);
    } finally {
      setIsLoading(false);
    }
  }, [saveSession]);

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem('yg_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        logout();
        return;
      }

      const normalized = normalizeUser(result.data);
      localStorage.setItem('yg_user', JSON.stringify(normalized));
      setUser(normalized);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('yg_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    user,
    isLoading,
    token: localStorage.getItem('yg_token'),
    isAuthenticated: !!user && !!localStorage.getItem('yg_token'),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    refreshMe,
  };
}
