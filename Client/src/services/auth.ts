import { api, getMediaUrl } from './api';
import type { User } from '../types/social';

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: any;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: any;
    stats: {
      followersCount: number;
      followingCount: number;
      storiesCount: number;
      unreadNotificationsCount: number;
    };
  };
}

export function formatBackendUser(raw: any): User {
  return {
    id: raw.id || raw._id,
    name: raw.fullName || raw.name || 'User',
    username: raw.username || 'user',
    avatar: getMediaUrl(raw.avatar),
    bio: raw.bio || '',
    online: Boolean(raw.isOnline ?? raw.online),
    lastSeen: raw.lastSeen ? (typeof raw.lastSeen === 'string' ? raw.lastSeen : new Date(raw.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : undefined,
    mutuals: raw.mutuals ?? 0,
  };
}

export const authService = {
  async register(data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    bio?: string;
  }): Promise<AuthResponse['data']> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    const { token, user } = res.data.data;
    localStorage.setItem('auren_token', token);
    localStorage.setItem('auren_user', JSON.stringify(formatBackendUser(user)));
    return { token, user: formatBackendUser(user) };
  },

  async login(usernameOrEmail: string, password: string): Promise<AuthResponse['data']> {
    const res = await api.post<AuthResponse>('/auth/login', { usernameOrEmail, password });
    const { token, user } = res.data.data;
    localStorage.setItem('auren_token', token);
    localStorage.setItem('auren_user', JSON.stringify(formatBackendUser(user)));
    return { token, user: formatBackendUser(user) };
  },

  async getMe(): Promise<MeResponse['data']> {
    const res = await api.get<MeResponse>('/auth/me');
    const { user, stats } = res.data.data;
    const formatted = formatBackendUser(user);
    localStorage.setItem('auren_user', JSON.stringify(formatted));
    return { user: formatted, stats };
  },

  async updateProfile(data: {
    fullName?: string;
    bio?: string;
    isPrivate?: boolean;
    avatar?: string;
  }): Promise<User> {
    const res = await api.put<{ success: boolean; data: { user: any } }>('/auth/profile', data);
    const formatted = formatBackendUser(res.data.data.user);
    localStorage.setItem('auren_user', JSON.stringify(formatted));
    return formatted;
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post<{ success: boolean; data: { avatar: string; user: any } }>(
      '/auth/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    const formatted = formatBackendUser(res.data.data.user);
    localStorage.setItem('auren_user', JSON.stringify(formatted));
    return getMediaUrl(res.data.data.avatar);
  },

  logout(): void {
    localStorage.removeItem('auren_token');
    localStorage.removeItem('auren_user');
  },

  getSavedUser(): User | null {
    const saved = localStorage.getItem('auren_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('auren_token');
  },
};

