import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuthUser,
  initAuthDatabase,
  getCurrentSession,
  loginUser,
  registerUser,
  logoutUser,
  createPasswordResetRequest,
  resetPasswordWithToken
} from '../services/authService';
import { soundManager } from '../utils/audio';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  requestReset: (email: string) => Promise<{ success: boolean; token?: string; error?: string }>;
  completeReset: (email: string, token: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        await initAuthDatabase();
        const active = getCurrentSession();
        setUser(active);
      } catch (err) {
        console.error('Session restore failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const login = async (email: string, pass: string, remember = false) => {
    setIsLoading(true);
    try {
      const res = await loginUser({ email, password: pass, rememberMe: remember });
      if (res.success && res.user) {
        setUser(res.user);
        soundManager.playSuccess(true);
        return { success: true };
      }
      soundManager.playError(true);
      return { success: false, error: res.error || 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      const res = await registerUser({ email, password: pass, name });
      if (res.success && res.user) {
        // Automatically log in newly created user
        await loginUser({ email, password: pass, rememberMe: true });
        setUser(res.user);
        soundManager.playSuccess(true);
        return { success: true };
      }
      soundManager.playError(true);
      return { success: false, error: res.error || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const requestReset = async (email: string) => {
    return await createPasswordResetRequest(email);
  };

  const completeReset = async (email: string, token: string, pass: string) => {
    const res = await resetPasswordWithToken({ email, token, newPassword: pass });
    if (res.success) {
      soundManager.playSuccess(true);
    } else {
      soundManager.playError(true);
    }
    return res;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    soundManager.playClick(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        requestReset,
        completeReset,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
