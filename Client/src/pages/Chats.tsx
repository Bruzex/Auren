import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircleIcon, SearchIcon, Loader2Icon } from 'lucide-react';
import { ConversationRow } from '../components/chat/ConversationRow';
import { ChatThread } from '../components/chat/ChatThread';
import { EmptyState } from '../components/EmptyState';
import { SegmentedControl } from '../components/SegmentedControl';
import { chatService } from '../services/chat';
import { getSocket } from '../services/socket';
import { getUser } from '../utils/users';
import type { Conversation } from '../types/social';

type Filter = 'all' | 'unread';

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
] as const;

export function Chats() {
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();

    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      loadConversations();
    };

    socket.on('conversation_updated', handleUpdate);
    socket.on('new_message', handleUpdate);

    return () => {
      socket.off('conversation_updated', handleUpdate);
      socket.off('new_message', handleUpdate);
    };
  }, [loadConversations]);

  const active = useMemo(
    () => conversations.find((c) => c.id === conversationId),
    [conversations, conversationId]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === 'unread' && c.unread === 0) return false;
      if (!q) return true;
      const user = c.user || getUser(c.userId);
      return (
        user.name.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q)
      );
    });
  }, [conversations, query, filter]);

  return (
    <div className="flex h-[100dvh] w-full md:gap-3 md:py-3 md:pr-3">
      <section
        aria-label="Conversations"
        className={`${
          conversationId ? 'hidden lg:flex' : 'flex'
        } min-h-0 w-full flex-col md:glass md:rounded-[28px] lg:w-[380px] lg:shrink-0`}
      >
        <div className="px-5 pb-3 pt-[max(env(safe-area-inset-top),24px)] md:pt-6">
          <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.028em]">
            Chats
          </h1>
          <label className="glass-pill mt-5 flex h-11 items-center gap-2.5 rounded-full px-4 transition-[box-shadow,border-color] duration-200 focus-within:border-accent/40 focus-within:shadow-[0_0_0_4px_rgba(90,130,255,0.14)]">
            <SearchIcon
              className="h-4 w-4 shrink-0 text-label-tertiary"
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <span className="sr-only">Search conversations</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-label-tertiary"
            />
          </label>
          <div className="mt-4">
            <SegmentedControl
              options={filterOptions}
              value={filter}
              onChange={setFilter}
              ariaLabel="Filter conversations"
            />
          </div>
        </div>

        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-28 md:pb-3">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2Icon className="h-6 w-6 animate-spin text-accent-soft" />
            </div>
          ) : visible.length > 0 ? (
            visible.map((c) => (
              <ConversationRow
                key={c.id}
                conversation={c}
                active={c.id === conversationId}
              />
            ))
          ) : (
            <EmptyState
              compact
              icon={MessageCircleIcon}
              title={
                filter === 'unread' && !query
                  ? 'No unread messages'
                  : 'No matches'
              }
              body={
                filter === 'unread' && !query
                  ? 'You’ve read everything. Enjoy the quiet.'
                  : 'Try a different name or username.'
              }
            />
          )}
        </div>
      </section>

      <section
        aria-label="Conversation"
        className={`${
          conversationId ? 'flex' : 'hidden lg:flex'
        } min-h-0 min-w-0 flex-1 overflow-hidden md:glass md:rounded-[28px]`}
      >
        {active ? (
          <ChatThread key={active.id} conversation={active} />
        ) : (
          <div className="flex w-full items-center justify-center">
            <EmptyState
              icon={MessageCircleIcon}
              title={conversationId ? 'Conversation not found' : 'Your messages'}
              body={
                conversationId
                  ? 'It may have been deleted.'
                  : 'Choose a conversation to pick up where you left off.'
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
