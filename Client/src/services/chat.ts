import { api, getMediaUrl } from './api';
import { formatBackendUser } from './auth';
import type { Conversation, Message } from '../types/social';

function formatMessageTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'now';
  }
}

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    const res = await api.get<{ success: boolean; data: any[] }>('/chats');
    return res.data.data.map((c) => ({
      id: c.id,
      userId: c.userId,
      user: c.user ? formatBackendUser(c.user) : undefined,
      lastMessage: c.lastMessage || '',
      time: c.time ? formatMessageTime(c.time) : '',
      unread: c.unread || 0,
      lastFromMe: Boolean(c.lastFromMe),
      muted: Boolean(c.muted),
    }));
  },

  async getOrCreateConversation(userId: string): Promise<Conversation> {
    const res = await api.get<{ success: boolean; data: any }>(`/chats/user/${userId}`);
    const c = res.data.data;
    return {
      id: c.id,
      userId: c.userId,
      user: c.user ? formatBackendUser(c.user) : undefined,
      lastMessage: c.lastMessage || '',
      time: c.time ? formatMessageTime(c.time) : '',
      unread: c.unread || 0,
    };
  },

  async getMessages(
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<{ messages: Message[]; pagination: any }> {
    const res = await api.get<{
      success: boolean;
      data: { messages: any[]; pagination: any };
    }>(`/chats/${conversationId}/messages`, {
      params: { page, limit },
    });

    const messages: Message[] = res.data.data.messages.map((m) => ({
      id: m.id,
      from: m.from,
      text: m.text,
      time: formatMessageTime(m.time),
      status: m.status,
    }));

    return { messages, pagination: res.data.data.pagination };
  },

  async sendMessage(
    conversationId: string,
    payload: { text?: string; type?: 'text' | 'image' | 'voice'; file?: File }
  ): Promise<Message> {
    let res;
    if (payload.file) {
      const formData = new FormData();
      formData.append('media', payload.file);
      if (payload.text) formData.append('text', payload.text);
      if (payload.type) formData.append('type', payload.type);

      res = await api.post<{ success: boolean; data: any }>(
        `/chats/${conversationId}/messages`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    } else {
      res = await api.post<{ success: boolean; data: any }>(
        `/chats/${conversationId}/messages`,
        { text: payload.text, type: payload.type || 'text' }
      );
    }

    const m = res.data.data;
    return {
      id: m.id,
      from: 'me',
      text: m.text,
      time: formatMessageTime(m.time),
      status: m.status || 'delivered',
    };
  },

  async markAsSeen(conversationId: string): Promise<void> {
    await api.put(`/chats/${conversationId}/seen`);
  },
};

