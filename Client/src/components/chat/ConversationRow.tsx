import React from 'react';
import { Link } from 'react-router-dom';
import { BellOffIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { getUser } from '../../utils/users';
import type { Conversation, User } from '../../types/social';

type ConversationRowProps = {
  conversation: Conversation;
  active?: boolean;
};

export function ConversationRow({ conversation, active = false }: ConversationRowProps) {
  const user: User = conversation.user || getUser(conversation.userId);
  const unread = conversation.unread > 0;

  return (
    <Link
      to={`/chats/${conversation.id}`}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3.5 rounded-[20px] px-3 py-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/60 ${
        active
          ? 'bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'hover:bg-white/[0.04]'
      }`}
    >
      <Avatar user={user} size={52} online={user.online} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[15px] font-semibold text-label">
            {user.name}
          </span>
          <span
            className={`shrink-0 text-[12px] tabular-nums ${
              unread ? 'text-accent-soft' : 'text-label-tertiary'
            }`}
          >
            {conversation.time}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-3">
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
    </Link>
  );
}
