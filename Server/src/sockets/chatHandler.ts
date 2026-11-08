import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socketAuth.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { logger } from '../utils/logger.js';

export function registerChatHandlers(io: Server, socket: AuthenticatedSocket): void {
  // Join a direct chat room
  socket.on('join_chat', (conversationId: string) => {
    if (!conversationId) return;
    socket.join(`chat:${conversationId}`);
    logger.debug(`Socket ${socket.id} joined chat:${conversationId}`);
  });

  // Leave a direct chat room
  socket.on('leave_chat', (conversationId: string) => {
    if (!conversationId) return;
    socket.leave(`chat:${conversationId}`);
    logger.debug(`Socket ${socket.id} left chat:${conversationId}`);
  });

  // Real-time message sending over Socket.io
  socket.on(
    'send_message',
    async (payload: { conversationId: string; content: string; type?: 'text' | 'image' | 'voice'; mediaUrl?: string }) => {
      try {
        if (!socket.user) {
          socket.emit('error', { message: 'Authentication required to send messages.' });
          return;
        }

        const { conversationId, content, type = 'text', mediaUrl } = payload;
        const currentUserId = socket.user._id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some((p) => p.toString() === currentUserId.toString())) {
          socket.emit('error', { message: 'Conversation not found or access denied.' });
          return;
        }

        const message = await Message.create({
          sender: currentUserId,
          conversation: conversation._id,
          content: content || (type === 'image' ? 'Sent a photo' : 'Sent an attachment'),
          type,
          mediaUrl,
          seen: false,
          seenBy: [currentUserId],
        });

        // Update conversation summary
        conversation.lastMessage = {
          text: message.content,
          sender: currentUserId,
          createdAt: message.createdAt,
          type: message.type,
        };

        conversation.participants.forEach((p) => {
          const pid = p.toString();
          if (pid !== currentUserId.toString()) {
            const current = conversation.unreadCounts?.get(pid) || 0;
            conversation.unreadCounts?.set(pid, current + 1);
          }
        });

        await conversation.save();

        const messageData = {
          id: message.id,
          conversationId,
          text: message.content,
          type: message.type,
          mediaUrl: message.mediaUrl,
          time: message.createdAt,
          status: 'delivered',
          sender: {
            id: socket.user.id,
            name: socket.user.fullName,
            username: socket.user.username,
            avatar: socket.user.avatar,
          },
        };

        // Broadcast to everyone in the chat room
        io.to(`chat:${conversationId}`).emit('new_message', messageData);

        // Notify participants in their personal rooms
        conversation.participants.forEach((p) => {
          if (p.toString() !== currentUserId.toString()) {
            io.to(`user:${p.toString()}`).emit('conversation_updated', {
              conversationId: conversation.id,
              lastMessage: message.content,
              time: message.createdAt,
              sender: {
                id: socket.user!.id,
                name: socket.user!.fullName,
              },
            });
          }
        });
      } catch (err: any) {
        logger.error('Error in send_message socket handler:', err);
        socket.emit('error', { message: 'Failed to deliver message' });
      }
    }
  );

  // Typing indicators
  socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
    if (!socket.user || !conversationId) return;
    socket.to(`chat:${conversationId}`).emit('user_typing', {
      conversationId,
      userId: socket.user.id,
      name: socket.user.fullName,
      isTyping: true,
    });
  });

  socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
    if (!socket.user || !conversationId) return;
    socket.to(`chat:${conversationId}`).emit('user_typing', {
      conversationId,
      userId: socket.user.id,
      name: socket.user.fullName,
      isTyping: false,
    });
  });

  // Message read receipts
  socket.on('mark_seen', async ({ conversationId }: { conversationId: string }) => {
    if (!socket.user || !conversationId) return;
    const currentUserId = socket.user._id;

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCounts.${currentUserId.toString()}`]: 0 },
    });

    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: currentUserId }, seen: false },
      { $set: { seen: true }, $addToSet: { seenBy: currentUserId } }
    );

    io.to(`chat:${conversationId}`).emit('messages_seen', {
      conversationId,
      seenBy: currentUserId.toString(),
    });
  });
}

