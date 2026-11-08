# Auren Backend API Server

Production-ready Node.js, Express, TypeScript, MongoDB, and Socket.io backend powering the **Auren** social app.

---

## Architecture & Features

- **Runtime & Language**: Node.js (ESM) + TypeScript
- **Framework**: Express.js with Helmet, CORS, Morgan, and Rate Limiting
- **Real-Time Layer**: Socket.io (real-time chat, typing indicators, online/offline status, anonymous rooms, notifications)
- **Database & ODM**: MongoDB with Mongoose (with TTL indexes for story and room expirations)
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs password hashing and Socket.io handshake auth
- **Storage**: Multer storage supporting both local disk storage (`/uploads`) and Cloudinary integration with automatic fallback
- **Validation**: Schema-based validation using Zod

---

## Directory Structure

```
server/
├── src/
│   ├── config/              ← Environment variables, MongoDB connection, Cloudinary
│   ├── controllers/         ← Auth, Users, Chats, Stories, Rooms, Notifications
│   ├── middleware/          ← Auth, Validation, Uploads, Error Handling
│   ├── models/              ← Mongoose models (User, FollowRequest, Conversation, Message, Story, AnonymousRoom, Notification)
│   ├── routes/              ← Express REST routes (/api/auth, /api/users, /api/chats, /api/stories, /api/rooms, /api/notifications, /api/health)
│   ├── sockets/             ← Socket.io authentication, chat handlers, anonymous room handlers
│   ├── utils/               ← JWT utilities, room code generators, structured logging
│   ├── scripts/             ← Database seed script (npm run seed)
│   ├── app.ts               ← Express application setup
│   └── server.ts            ← Server entrypoint & graceful shutdown
├── .env.example             ← Environment variable template
├── package.json
└── tsconfig.json
```

---

## Environment Configuration

Create a `.env` file in the `server/` directory (see `.env.example`):

```ini
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/auren

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Optional Cloudinary (Local storage fallback is used if omitted)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the server in development mode with `tsx watch` |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm start` | Runs the compiled production code from `dist/server.js` |
| `npm run seed` | Seeds MongoDB with sample users, stories, rooms, and conversations |

---

## REST API Endpoints

### 1. Health Check
- `GET /api/health` — Server health, uptime, and MongoDB status.

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register` — Create new account `{ username, email, password, fullName, bio? }`
- `POST /api/auth/login` — Login with `{ usernameOrEmail, password }`
- `GET /api/auth/me` — Get authenticated user details and profile stats *(Protected)*
- `PUT /api/auth/profile` — Update name, bio, isPrivate, avatar *(Protected)*
- `POST /api/auth/avatar` — Upload avatar image file (`multipart/form-data`) *(Protected)*

### 3. Users & Social (`/api/users`)
- `GET /api/users/search?q=:query` — Search users by username or full name *(Protected)*
- `GET /api/users/suggested` — Suggested users to connect with *(Protected)*
- `GET /api/users/:username` — Get public user profile and follow state
- `POST /api/users/:id/follow` — Follow / Unfollow / Request follow toggle *(Protected)*
- `GET /api/users/requests/pending` — Get pending follow requests received *(Protected)*
- `POST /api/users/requests/:id/accept` — Accept follow request *(Protected)*
- `POST /api/users/requests/:id/reject` — Decline follow request *(Protected)*
- `GET /api/users/:id/followers` — List of user followers
- `GET /api/users/:id/following` — List of accounts followed by user

### 4. Direct Chats (`/api/chats`)
- `GET /api/chats` — List conversations with participant details and unread counts *(Protected)*
- `GET /api/chats/user/:userId` — Retrieve or initiate direct conversation with user *(Protected)*
- `GET /api/chats/:conversationId/messages` — Paginated message thread history *(Protected)*
- `POST /api/chats/:conversationId/messages` — Send message (text or file attachment) *(Protected)*
- `PUT /api/chats/:conversationId/seen` — Mark all messages in conversation as read *(Protected)*

### 5. Stories (`/api/stories`)
- `POST /api/stories` — Create story (camera image or text canvas mode, expires in 24h) *(Protected)*
- `GET /api/stories/feed` — Feed of active stories from followed users + own stories *(Protected)*
- `GET /api/stories/user/:userId` — Get active and archived stories for user profile
- `POST /api/stories/:id/view` — Record story view by viewer *(Protected)*
- `DELETE /api/stories/:id` — Delete own story *(Protected)*

### 6. Anonymous Rooms (`/api/rooms`)
- `POST /api/rooms` — Create anonymous room with duration (`1h`, `24h`, `7d`) → returns 6-character code
- `POST /api/rooms/join` — Join room with code `{ code, alias? }`
- `GET /api/rooms` — List active public rooms
- `GET /api/rooms/:code` — Get room information and recent messages

### 7. Notifications (`/api/notifications`)
- `GET /api/notifications` — Get activity feed grouped by "Today" and "This week" *(Protected)*
- `PUT /api/notifications/:id/read` — Mark notification as read *(Protected)*
- `PUT /api/notifications/read-all` — Mark all notifications as read *(Protected)*

---

## Real-Time WebSocket Events (Socket.io)

### Connection & Authentication
Connect to `ws://localhost:5000` with the JWT in auth payload:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'YOUR_JWT_TOKEN' },
  withCredentials: true,
});
```

### Client -> Server Events
- `join_chat`: `conversationId`
- `leave_chat`: `conversationId`
- `send_message`: `{ conversationId, content, type?, mediaUrl? }`
- `typing_start`: `{ conversationId }`
- `typing_stop`: `{ conversationId }`
- `mark_seen`: `{ conversationId }`
- `join_anonymous_room`: `{ code, alias }`
- `send_room_message`: `{ code, alias, content }`
- `leave_anonymous_room`: `{ code, alias }`

### Server -> Client Broadcasts
- `user_status`: `{ userId, isOnline, lastSeen? }`
- `new_message`: `{ id, conversationId, text, type, time, sender, from }`
- `conversation_updated`: `{ conversationId, lastMessage, time, sender }`
- `user_typing`: `{ conversationId, userId, name, isTyping }`
- `messages_seen`: `{ conversationId, seenBy }`
- `new_notification`: `{ type, sender }`
- `new_story`: `{ storyId, user }`
- `new_room_message`: `{ id, alias, content, createdAt }`
- `room_user_joined`: `{ alias, peopleCount }`
- `room_user_left`: `{ alias, peopleCount }`

