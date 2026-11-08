import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ENV } from '../config/environment.js';
import { socketAuthMiddleware, AuthenticatedSocket } from './socketAuth.js';
import { registerChatHandlers } from './chatHandler.js';
import { registerRoomHandlers } from './roomHandler.js';
import { User } from '../models/User.js';
import { AnonymousRoom } from '../models/AnonymousRoom.js';
import { logger } from '../utils/logger.js';

let ioInstance: Server | null = null;

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  ioInstance = io;

  // Use socket authentication middleware
  io.use(socketAuthMiddleware);

  io.on('connection', async (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const user = socket.user;

    logger.info(`Socket connected: ${socket.id} (User: ${user ? user.username : 'Anonymous'})`);

    if (user) {
      // Join user's personal notification/updates room
      socket.join(`user:${user.id}`);

      // Set user online in database
      await User.findByIdAndUpdate(user._id, {
        $set: { isOnline: true, lastSeen: new Date() },
      });

      // Broadcast online status to network
      io.emit('user_status', {
        userId: user.id,
        isOnline: true,
      });
    }

    // Register Chat & Anonymous Room handlers
    registerChatHandlers(io, socket);
    registerRoomHandlers(io, socket);

    // Disconnect event
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id}`);

      if (user) {
        await User.findByIdAndUpdate(user._id, {
          $set: { isOnline: false, lastSeen: new Date() },
        });

        io.emit('user_status', {
          userId: user.id,
          isOnline: false,
          lastSeen: new Date(),
        });
      }

      // Cleanup anonymous room if socket was in any
      try {
        const rooms = await AnonymousRoom.find({ 'participants.socketId': socket.id });
        for (const room of rooms) {
          room.participants = room.participants.filter((p) => p.socketId !== socket.id);
          if (room.participants.length === 0) {
            room.isActive = false;
          }
          await room.save();
          io.to(`room:${room.code}`).emit('room_user_left', {
            socketId: socket.id,
            peopleCount: room.participants.length,
          });
        }
      } catch (err) {
        logger.error('Error cleaning up disconnected room socket:', err);
      }
    });
  });

  return io;
}

export function getIO(): Server {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet. Call initSocketServer first.');
  }
  return ioInstance;
}

