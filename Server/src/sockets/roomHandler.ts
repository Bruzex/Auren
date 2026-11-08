import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socketAuth.js';
import { AnonymousRoom } from '../models/AnonymousRoom.js';
import { logger } from '../utils/logger.js';

export function registerRoomHandlers(io: Server, socket: AuthenticatedSocket): void {
  // Join anonymous room
  socket.on(
    'join_anonymous_room',
    async ({ code, alias }: { code: string; alias: string }) => {
      try {
        const cleanCode = (code || '').trim().toUpperCase();
        const room = await AnonymousRoom.findOne({
          code: cleanCode,
          isActive: true,
          expiresAt: { $gt: new Date() },
        });

        if (!room) {
          socket.emit('room_error', { message: 'Room not found or expired' });
          return;
        }

        socket.join(`room:${cleanCode}`);

        // Update participant socket ID
        const existing = room.participants.find((p) => p.alias === alias);
        if (existing) {
          existing.socketId = socket.id;
        } else {
          room.participants.push({
            alias,
            socketId: socket.id,
            user: socket.user?._id,
            joinedAt: new Date(),
          });
        }
        await room.save();

        io.to(`room:${cleanCode}`).emit('room_user_joined', {
          alias,
          peopleCount: room.participants.length,
        });

        logger.info(`Alias "${alias}" joined room ${cleanCode}`);
      } catch (err: any) {
        logger.error('Error in join_anonymous_room:', err);
      }
    }
  );

  // Send anonymous room message
  socket.on(
    'send_room_message',
    async ({ code, alias, content }: { code: string; alias: string; content: string }) => {
      try {
        const cleanCode = (code || '').trim().toUpperCase();
        if (!content?.trim()) return;

        const room = await AnonymousRoom.findOne({
          code: cleanCode,
          isActive: true,
          expiresAt: { $gt: new Date() },
        });

        if (!room) {
          socket.emit('room_error', { message: 'Room is inactive or closed' });
          return;
        }

        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newMessage = {
          id: messageId,
          alias,
          content: content.trim(),
          createdAt: new Date(),
        };

        room.messages.push(newMessage);
        await room.save();

        io.to(`room:${cleanCode}`).emit('new_room_message', newMessage);
      } catch (err: any) {
        logger.error('Error in send_room_message:', err);
      }
    }
  );

  // Leave anonymous room
  socket.on(
    'leave_anonymous_room',
    async ({ code, alias }: { code: string; alias: string }) => {
      try {
        const cleanCode = (code || '').trim().toUpperCase();
        socket.leave(`room:${cleanCode}`);

        const room = await AnonymousRoom.findOne({ code: cleanCode });
        if (room) {
          room.participants = room.participants.filter(
            (p) => p.socketId !== socket.id && p.alias !== alias
          );

          if (room.participants.length === 0) {
            room.isActive = false; // Mark inactive when empty
          }

          await room.save();

          io.to(`room:${cleanCode}`).emit('room_user_left', {
            alias,
            peopleCount: room.participants.length,
          });
        }
      } catch (err: any) {
        logger.error('Error in leave_anonymous_room:', err);
      }
    }
  );
}

