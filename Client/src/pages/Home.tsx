import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, CameraIcon } from 'lucide-react';
import { StoriesRow } from '../components/stories/StoriesRow';
import { StoryViewer } from '../components/stories/StoryViewer';
import { ConversationRow } from '../components/chat/ConversationRow';
import { RequestsPreview } from '../components/home/RequestsPreview';
import { RoomTeaser } from '../components/home/RoomTeaser';
import { buttonStyles } from '../components/Button';
import { iconButtonStyles } from '../components/IconButton';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/stories';
import { chatService } from '../services/chat';
import { getSocket } from '../services/socket';
import { formatToday, greeting } from '../utils/time';
import type { Story, Conversation } from '../types/social';

export function Home() {
  const { user, stats } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const now = new Date();
  const unreadCount = conversations.filter((c) => c.unread > 0).length;

  const loadData = useCallback(async () => {
    try {
      const [feedStories, chatList] = await Promise.all([
        storyService.getStoriesFeed(),
        chatService.getConversations(),
      ]);
      setStories(feedStories);
      setConversations(chatList);
    } catch (err) {
      console.warn('Error loading home data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();

    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      loadData();
    };

    socket.on('new_message', handleUpdate);
    socket.on('conversation_updated', handleUpdate);
    socket.on('new_story', handleUpdate);

    return () => {
      socket.off('new_message', handleUpdate);
      socket.off('conversation_updated', handleUpdate);
      socket.off('new_story', handleUpdate);
    };
  }, [loadData]);

  const markViewed = async (id: string) => {
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, viewed: true } : s)));
    try {
      await storyService.viewStory(id);
    } catch {}
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="mx-auto w-full max-w-[1160px] px-5 pb-32 pt-[max(env(safe-area-inset-top),24px)] md:px-8 md:pb-12 md:pt-10">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[14px] text-label-tertiary">{formatToday(now)}</p>
          <h1 className="mt-1 text-[30px] font-semibold leading-[1.1] tracking-[-0.028em] md:text-[34px]">
            {greeting(now)}, {displayName}
          </h1>
          <p className="mt-2 text-[15px] text-label-secondary">
            {unreadCount > 0 ? `${unreadCount} conversations waiting for you` : 'You’re all caught up'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/notifications"
            aria-label="Activity"
            className={`${iconButtonStyles()} relative md:hidden`}
          >
            <BellIcon className="h-5 w-5" strokeWidth={1.6} />
            {(stats?.unreadNotificationsCount ?? 0) > 0 && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent glow-accent" />
            )}
          </Link>
          <Link to="/story/new" aria-label="New story" className={`${iconButtonStyles()} md:hidden`}>
            <CameraIcon className="h-5 w-5" strokeWidth={1.6} />
          </Link>
          <Link
            to="/story/new"
            className={`${buttonStyles('primary', 'md')} hidden md:inline-flex`}
          >
            <CameraIcon className="h-4 w-4" strokeWidth={1.8} />
            New story
          </Link>
        </div>
      </header>

      <section aria-label="Stories" className="-mx-5 mt-8 md:mx-0">
        <StoriesRow stories={stories} onOpen={setViewerIndex} />
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="recent-heading">
          <div className="mb-3 flex items-baseline justify-between px-1">
            <h2 id="recent-heading" className="text-[19px] font-semibold tracking-[-0.02em]">
              Messages
            </h2>
            <Link
              to="/chats"
              className="rounded-md text-[14px] text-accent-soft transition-colors duration-150 hover:text-label"
            >
              See all
            </Link>
          </div>
          <div className="glass rounded-[26px] p-2">
            {conversations.length > 0 ? (
              conversations
                .slice(0, 6)
                .map((conversation) => (
                  <ConversationRow key={conversation.id} conversation={conversation} />
                ))
            ) : (
              <p className="p-6 text-center text-[14px] text-label-tertiary">
                No recent conversations. Search for someone to chat!
              </p>
            )}
          </div>
        </section>

        <aside className="hidden flex-col gap-5 lg:flex lg:pt-10" aria-label="Shortcuts">
          <RequestsPreview />
          <RoomTeaser />
        </aside>
      </div>

      <StoryViewer
        stories={stories}
        index={viewerIndex}
        onIndexChange={setViewerIndex}
        onClose={() => setViewerIndex(null)}
        onViewed={markViewed}
      />
    </div>
  );
}
