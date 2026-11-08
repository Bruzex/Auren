import { api, getMediaUrl } from './api';
import { formatBackendUser } from './auth';
import type { Activity } from '../types/social';

export const notificationService = {
  async getNotifications(): Promise<Activity[]> {
    const res = await api.get<{ success: boolean; data: any[] }>('/notifications');
    return res.data.data.map((n) => ({
      id: n.id,
      group: n.group || 'Today',
      kind: n.kind || 'follow',
      userIds: n.userIds || [],
      user: n.user ? formatBackendUser(n.user) : undefined,
      text: n.text || '',
      time: n.time ? new Date(n.time).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'recently',
      thumb: n.data?.thumb ? getMediaUrl(n.data.thumb) : undefined,
    } as any));
  },

  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },
};

