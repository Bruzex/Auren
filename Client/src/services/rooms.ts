import { api } from './api';

export interface RoomDetails {
  code: string;
  name: string;
  alias?: string;
  duration?: string;
  expiresAt: string;
  people?: number;
  participantsCount?: number;
  messages?: Array<{
    id: string;
    alias: string;
    content: string;
    createdAt: string;
  }>;
}

export const roomService = {
  async createRoom(name = 'Secret Room', duration = '24h'): Promise<RoomDetails> {
    const res = await api.post<{ success: boolean; data: RoomDetails }>('/rooms', {
      name,
      duration,
    });
    return res.data.data;
  },

  async joinRoom(code: string, alias?: string): Promise<RoomDetails> {
    const cleanCode = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const res = await api.post<{ success: boolean; data: RoomDetails }>('/rooms/join', {
      code: cleanCode,
      alias,
    });
    return res.data.data;
  },

  async getRecentRooms(): Promise<Array<{ code: string; name: string; people: number; expiresAt: string }>> {
    const res = await api.get<{ success: boolean; data: any[] }>('/rooms');
    return res.data.data;
  },

  async getRoomDetails(code: string): Promise<RoomDetails> {
    const cleanCode = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const res = await api.get<{ success: boolean; data: RoomDetails }>(`/rooms/${cleanCode}`);
    return res.data.data;
  },
};

