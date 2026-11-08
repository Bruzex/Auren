import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellOffIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { getUser } from '../../utils/users';
import type { Conversation, User } from '../../types/social';

type ConversationRowProps = {
  conversation: Conversation;
  active?: boolean;
};

export function ConversationRow({ conversation, active = false }: ConversationRowProps) {
  const navigate = useNavigate();
  const user: User = conversation.user || getUser(conversation.userId);
  const unread = conversation.unread > 0;
  const profileUrl = `/profile/${user.username || user.id}`;

  const openChat = () => {
    navigate(`/chats/${conversation.id}`);
  };

  return (
    <div
      aria-current={active ? 'page' : undefined}
      className={`group flex items-center gap-3.5 rounded-[20px] px-3 py-3 transition-colors duration-150 ${
        active
          ? 'bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'hover:bg-white/[0.04]'
      }`}
    >
      {/* Avatar links to profile */}
      <Link
        to={profileUrl}
        aria-label={`View ${user.name}'s profile`}
        className="shrink-0 rounded-full transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <Avatar user={user} size={52} online={user.online} />
      </Link>

      {/* Row content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          {/* User name links to profile */}
          <Link
            to={profileUrl}
            className="truncate text-[15px] font-semibold text-label transition-colors hover:text-accent-soft hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded"
          >
            {user.name}
          </Link>
          <span
            onClick={openChat}
            className={`cursor-pointer shrink-0 text-[12px] tabular-nums ${
              unread ? 'text-accent-soft' : 'text-label-tertiary'
            }`}
          >
            {conversation.time}
          </span>
        </div>

        {/* Message snippet and unread badge open the chat */}
        <div
          onClick={openChat}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openChat();
            }
          }}
          className="mt-0.5 flex cursor-pointer items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded"
        >
          <p
            className={`truncate text-[14px] ${
              unread ? 'text-label' : 'text-label-secondary'
            }`}
          >
            {conversation.typing ? (
              <span className="text-accent-soft">typing…</span>
            ) : (
              <>
                {conversation.lastFromMe && (
                  <span className="text-label-tertiary">You: </span>
                )}
                {conversation.lastMessage}
              </>
            )}
          </p>
          {unread ? (
            <span className="btn-accent flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums">
              {conversation.unread}
            </span>
          ) : conversation.muted ? (
            <BellOffIcon
              className="h-3.5 w-3.5 shrink-0 text-label-tertiary"
              strokeWidth={1.6}
              aria-label="Muted"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
