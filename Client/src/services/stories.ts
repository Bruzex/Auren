import { api, getMediaUrl } from './api';
import { formatBackendUser } from './auth';
import type { Story, ArchivedStory, UserStoryGroup } from '../types/social';

function formatPostedAgo(dateString: string): string {
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return 'recently';
  }
}

export interface StoryLikersResponse {
  id: string;
  name: string;
  username: string;
  avatar: string;
  online?: boolean;
}

export const storyService = {
  async getStoriesFeed(): Promise<UserStoryGroup[]> {
    const res = await api.get<{ success: boolean; data: any[] }>('/stories/feed');
    const feed = res.data.data;

    return feed.map((group) => {
      const formattedUser = group.user ? formatBackendUser(group.user) : undefined;
      return {
        userId: group.userId,
        user: formattedUser,
        allViewed: Boolean(group.allViewed),
        latestTime: group.latestTime,
        stories: (group.stories || []).map((s: any) => ({
          id: s.id,
          userId: group.userId,
          image: getMediaUrl(s.image),
          caption: s.caption,
          postedAgo: formatPostedAgo(s.time),
          viewed: Boolean(s.viewed),
          viewsCount: s.viewsCount || 0,
          likesCount: s.likesCount || 0,
          isLiked: Boolean(s.isLiked),
          user: formattedUser,
        })),
      };
    });
  },

  async likeStory(storyId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const res = await api.post<{ success: boolean; data: { isLiked: boolean; likesCount: number } }>(
      `/stories/${storyId}/like`
    );
    return res.data.data;
  },

  async getStoryLikes(storyId: string): Promise<StoryLikersResponse[]> {
    const res = await api.get<{ success: boolean; data: any[] }>(`/stories/${storyId}/likes`);
    return res.data.data.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      avatar: getMediaUrl(u.avatar),
      online: Boolean(u.online),
    }));
  },

  async getUserStories(userId: string): Promise<ArchivedStory[]> {
    const res = await api.get<{ success: boolean; data: any[] }>(`/stories/user/${userId}`);
    return res.data.data.map((s) => ({
      id: s.id,
      image: getMediaUrl(s.image),
      views: s.views || 0,
      label: s.label || (s.active ? 'Active' : 'Expired'),
      active: Boolean(s.active),
    }));
  },

  async createStory(payload: {
    file?: File;
    mediaUrl?: string;
    caption?: string;
    mode?: 'camera' | 'text';
    textStyle?: string;
    textColor?: string;
    backgroundGradient?: string;
    audience?: 'story' | 'close-friends';
  }): Promise<any> {
    if (payload.file) {
      const formData = new FormData();
      formData.append('media', payload.file);
      if (payload.caption) formData.append('caption', payload.caption);
      if (payload.mode) formData.append('mode', payload.mode);
      if (payload.textStyle) formData.append('textStyle', payload.textStyle);
      if (payload.textColor) formData.append('textColor', payload.textColor);
      if (payload.backgroundGradient) formData.append('backgroundGradient', payload.backgroundGradient);
      if (payload.audience) formData.append('audience', payload.audience);

      const res = await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    }

    const res = await api.post('/stories', payload);
    return res.data.data;
  },

  async viewStory(storyId: string): Promise<void> {
    try {
      await api.post(`/stories/${storyId}/view`);
    } catch {}
  },

  async deleteStory(storyId: string): Promise<void> {
    await api.delete(`/stories/${storyId}`);
  },
};

