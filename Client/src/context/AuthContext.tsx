import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, MeResponse } from '../services/auth';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { cacheUser } from '../utils/users';
import type { User } from '../types/social';

interface AuthContextType {
  user: User | null;
  stats: MeResponse['data']['stats'] | null;
  token: string | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    bio?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { fullName?: string; bio?: string; isPrivate?: boolean }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getSavedUser());
  const [stats, setStats] = useState<MeResponse['data']['stats'] | null>(null);
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authService.getMe();
      setUser(data.user);
      setStats(data.stats);
      cacheUser(data.user);
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;
    async function initAuth() {
      const storedToken = authService.getToken();
      if (!storedToken) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const data = await authService.getMe();
        if (mounted) {
          setUser(data.user);
          setStats(data.stats);
          cacheUser(data.user);
          connectSocket(storedToken);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        authService.logout();
        if (mounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Socket notification listener
  useEffect(() => {
    if (!token) return;
    const s = getSocket() || connectSocket(token);

    const onNotification = () => {
      setStats((prev) =>
        prev
          ? { ...prev, unreadNotificationsCount: prev.unreadNotificationsCount + 1 }
          : null
      );
    };

    s.on('new_notification', onNotification);
    return () => {
      s.off('new_notification', onNotification);
    };
  }, [token]);

  const login = async (usernameOrEmail: string, password: string) => {
    const data = await authService.login(usernameOrEmail, password);
    setToken(data.token);
    setUser(data.user);
    cacheUser(data.user);
    connectSocket(data.token);
    await refreshUser();
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    bio?: string;
  }) => {
    const data = await authService.register(userData);
    setToken(data.token);
    setUser(data.user);
    cacheUser(data.user);
    connectSocket(data.token);
    await refreshUser();
  };

  const logout = () => {
    authService.logout();
    disconnectSocket();
    setUser(null);
    setStats(null);
    setToken(null);
    window.location.href = '/auth';
  };

  const updateProfile = async (data: { fullName?: string; bio?: string; isPrivate?: boolean }) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    cacheUser(updated);
  };

  const uploadAvatar = async (file: File) => {
    const avatarUrl = await authService.uploadAvatar(file);
    setUser((prev) => (prev ? { ...prev, avatar: avatarUrl } : prev));
    return avatarUrl;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        uploadAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

