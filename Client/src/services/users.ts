import { api, getMediaUrl } from './api';
import { formatBackendUser } from './auth';
import type { User, FollowRequest, FollowStatus } from '../types/social';

export interface SearchUserResult extends User {
  followStatus: FollowStatus;
  isMutual?: boolean;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  online: boolean;
  lastSeen?: string;
  isPrivate: boolean;
  mutuals: number;
  isMutual?: boolean;
  stats: {
    followersCount: number;
    followingCount: number;
    storiesCount: number;
  };
  followStatus: FollowStatus;
}

export const userService = {
  async searchUsers(query: string): Promise<SearchUserResult[]> {
    if (!query.trim()) return [];
    const res = await api.get<{ success: boolean; data: any[] }>(`/users/search`, {
      params: { q: query },
    });
    return res.data.data.map((u) => ({
      ...formatBackendUser(u),
      followStatus: u.followStatus || 'follow',
      mutuals: u.mutuals || 0,
      isMutual: Boolean(u.isMutual),
    }));
  },

  async getSuggestedUsers(): Promise<SearchUserResult[]> {
    const res = await api.get<{ success: boolean; data: any[] }>(`/users/suggested`);
    return res.data.data.map((u) => ({
      ...formatBackendUser(u),
      followStatus: u.followStatus || 'follow',
      mutuals: u.mutuals || 0,
      isMutual: Boolean(u.isMutual),
    }));
  },

  async getUserProfile(username: string): Promise<UserProfileResponse> {
    const res = await api.get<{ success: boolean; data: any }>(`/users/${username}`);
    const d = res.data.data;
    return {
      ...d,
      avatar: getMediaUrl(d.avatar),
      followStatus: d.followStatus || 'follow',
    };
  },

  async toggleFollow(targetUserId: string): Promise<FollowStatus> {
    const res = await api.post<{ success: boolean; data: { followStatus: FollowStatus } }>(
      `/users/${targetUserId}/follow`
    );
    return res.data.data.followStatus;
  },

  async getPendingRequests(): Promise<FollowRequest[]> {
    const res = await api.get<{ success: boolean; data: any[] }>(`/users/requests/pending`);
    return res.data.data.map((r) => ({
      id: r.id,
      userId: r.userId,
      user: r.user ? formatBackendUser(r.user) : undefined,
      time: r.time ? new Date(r.time).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'recently',
    }));
  },

  async acceptFollowRequest(requestId: string): Promise<void> {
    await api.post(`/users/requests/${requestId}/accept`);
  },

  async rejectFollowRequest(requestId: string): Promise<void> {
    await api.post(`/users/requests/${requestId}/reject`);
  },

  async getFollowers(userId: string): Promise<User[]> {
    const res = await api.get<{ success: boolean; data: any[] }>(`/users/${userId}/followers`);
    return res.data.data.map(formatBackendUser);
  },

  async getFollowing(userId: string): Promise<User[]> {
    const res = await api.get<{ success: boolean; data: any[] }>(`/users/${userId}/following`);
    return res.data.data.map(formatBackendUser);
  },
};

