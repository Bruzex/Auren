import { Socket } from 'socket.io';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { User, IUser } from '../models/User.js';
import { logger } from '../utils/logger.js';

export interface AuthenticatedSocket extends Socket {
  user?: IUser;
  tokenPayload?: TokenPayload;
}

export async function socketAuthMiddleware(
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token;

    if (!token) {
      // Anonymous connection allowed (e.g. for anonymous rooms)
      return next();
    }

    const payload = verifyToken(token as string);
    const user = await User.findById(payload.userId);

    if (user) {
      socket.user = user;
      socket.tokenPayload = payload;
    }

    next();
  } catch (err: any) {
    logger.debug('Socket auth error (proceeding as guest):', err.message);
    next();
  }
}

