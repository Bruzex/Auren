import { api, getMediaUrl } from './api';
import { formatBackendUser } from './auth';
import type { Story, ArchivedStory } from '../types/social';

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

export interface UserStoryFeedItem {
  userId: string;
  user: any;
  stories: Array<{
    id: string;
    image: string;
    caption?: string;
    mode: 'camera' | 'text';
    textStyle?: string;
    textColor?: string;
    backgroundGradient?: string;
    audience: string;
    time: string;
    viewed: boolean;
    viewsCount: number;
  }>;
  allViewed: boolean;
  latestTime: string;
}

export const storyService = {
  async getStoriesFeed(): Promise<Story[]> {
    const res = await api.get<{ success: boolean; data: UserStoryFeedItem[] }>('/stories/feed');
    const feed = res.data.data;

    // Flatten to Story[] representation for StoriesRow and StoryViewer
    const flattenedStories: Story[] = [];

    feed.forEach((group) => {
      group.stories.forEach((s) => {
        flattenedStories.push({
          id: s.id,
          userId: group.userId,
          image: getMediaUrl(s.image),
          caption: s.caption,
          postedAgo: formatPostedAgo(s.time),
          viewed: s.viewed,
          user: group.user ? formatBackendUser(group.user) : undefined,
        } as any);
      });
    });

    return flattenedStories;
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

