# Auren

**Auren** is an iOS-inspired glassmorphism social chat and stories platform featuring dark aesthetics, electric blue and violet accents, real-time looking chat threads, ephemeral anonymous rooms, and interactive story creation.

---

## Project Structure

```
Auren/
├── client/          ← Frontend application (React + Vite + TypeScript + Tailwind CSS)
│   ├── public/      ← Static assets and sample media
│   ├── src/
│   │   ├── components/   ← Reusable UI & design system components
│   │   │   ├── chat/           ← MessageBubble, ChatThread, Composer, ConversationRow
│   │   │   ├── home/           ← RequestsPreview, RoomTeaser
│   │   │   ├── layout/         ← AppShell, Sidebar, TabBar
│   │   │   ├── notifications/  ← ActivityRow
│   │   │   ├── profile/        ← EditProfileSheet
│   │   │   ├── rooms/          ← CreateRoomCard, JoinRoomCard
│   │   │   ├── stories/        ← StoriesRow, StoryViewer
│   │   │   ├── story/          ← StoryTextEditor, useStoryComposer
│   │   │   ├── Avatar.tsx      ← Avatar with story ring and status indicator
│   │   │   ├── AurenMark.tsx   ← Brand geometric mark with glowing gradient
│   │   │   ├── Button.tsx      ← Button variants (primary, glass, ghost, danger)
│   │   │   ├── EmptyState.tsx  ← Frosted empty states
│   │   │   ├── FollowButton.tsx← Follow / Requested / Following states
│   │   │   ├── IconButton.tsx  ← Circular frosted glass icon buttons
│   │   │   ├── PageHeader.tsx  ← Consistent screen header component
│   │   │   ├── SegmentedControl.tsx ← iOS glass segmented pill control
│   │   │   ├── TextField.tsx   ← Glass inputs with focus states
│   │   │   └── UserRow.tsx     ← User listing row with meta and action slots
│   │   ├── data/         ← Mock data (conversations, notifications, users, stories, rooms)
│   │   ├── pages/        ← Application screens (Home, Chats, Search, Notifications, Profile, Rooms, CreateStory)
│   │   ├── types/        ← TypeScript interfaces and domain types
│   │   ├── utils/        ← Helper functions (time formatting, users, room codes)
│   │   ├── App.tsx       ← Application router configuration and transitions
│   │   ├── index.css     ← Design system styles, glass tokens, blur filters, ambient glow
│   │   └── index.tsx     ← React application entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── server/          ← Backend service (Node.js + Express + TypeScript + Socket.io + MongoDB)
    ├── src/
    │   ├── config/      ← Database, Cloudinary, environment variables
    │   ├── controllers/ ← Auth, Users, Chats, Stories, Rooms, Notifications
    │   ├── middleware/  ← Auth (JWT), Validation (Zod), Uploads (Multer), Error handling
    │   ├── models/      ← Mongoose models (User, FollowRequest, Conversation, Message, Story, Room, Notification)
    │   ├── routes/      ← Express REST routes (/api/*)
    │   ├── sockets/     ← Socket.io real-time chat & room handlers
    │   ├── utils/       ← JWT helpers, room code generation, logging
    │   ├── scripts/     ← Database seed script (npm run seed)
    │   ├── app.ts       ← Express app configuration
    │   └── server.ts    ← Server bootstrap & graceful shutdown
    ├── .env.example
    ├── package.json
    └── tsconfig.json
```

---

## Features & Screens

- **Home**: Horizontal stories reel with gradient rings and full-screen viewer, unread message count, recent conversations, follow request preview, and anonymous room shortcuts.
- **Search**: Dynamic user search with instant filtering, suggested accounts, and follow/requested state toggle.
- **Notifications**: Categorized activity timeline ("Today", "This week") with pending follow request cards and Accept / Decline actions.
- **Chats & Messaging**: Real-time 1-to-1 chat via Socket.io and REST, master-detail responsive view, active typing indicators, timestamps, message bubbles with send statuses, and message composer with attachment actions.
- **Anonymous Rooms**: Disposable peer rooms with ephemeral random codes (e.g. `NOX4LU`), encrypted temporary identity assignment, and automatic TTL expiration.
- **Story Creation Studio**: Camera capture, text mode with draggable and customizable typography, gradient canvas picker, and dual-audience sharing (Your story vs Close friends) with 24-hour expiration.
- **Profile**: Account header with stats (Followers, Following, Stories), bio, highlights reel, tabbed active & archived stories grid, profile link sharing, and Edit Profile modal.

---

## Getting Started

### 1. Backend Server Setup

```bash
cd server
npm install

# Start development server with live reload
npm run dev

# (Optional) Seed initial users and mock data
npm run seed
```

The API server runs at [http://localhost:5000](http://localhost:5000) and Socket.io at `ws://localhost:5000`.
Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health).

### 2. Frontend Client Setup

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build

```bash
# Build frontend
npm --prefix client run build

# Build backend
npm --prefix server run build
```

