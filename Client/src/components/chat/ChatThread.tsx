import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, LockIcon, PhoneIcon, VideoIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { IconButton, iconButtonStyles } from '../IconButton';
import { MessageBubble } from './MessageBubble';
import { TypingBubble } from './TypingBubble';
import { Composer } from './Composer';
import { useChatThread } from './useChatThread';
import { getUser } from '../../utils/users';
import type { Conversation, User } from '../../types/social';

export function ChatThread({ conversation }: { conversation: Conversation }) {
  const user: User = conversation.user || getUser(conversation.userId);
  const { messages, isTyping, send, onTyping, scrollRef, initialCount } =
    useChatThread(conversation);

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <header className="glass-strong z-10 flex items-center gap-3 border-x-0 border-t-0 px-3 pb-3 pt-[max(env(safe-area-inset-top),12px)] md:border-b md:border-hairline md:bg-transparent md:bg-none md:px-5 md:py-4 md:shadow-none md:backdrop-blur-none">
        <Link
          to="/chats"
          aria-label="Back to chats"
          className={`${iconButtonStyles('sm')} lg:hidden`}
        >
          <ChevronLeftIcon className="h-5 w-5" strokeWidth={1.8} />
        </Link>
        <Link
          to={`/profile/${user.username || user.id}`}
          className="group flex items-center gap-3 min-w-0 flex-1 hover:opacity-90 transition-opacity focus-visible:outline-none"
        >
          <Avatar user={user} size={42} online={user.online} className="transition-transform group-hover:scale-105" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[16px] font-semibold tracking-[-0.015em] text-label group-hover:text-accent-soft transition-colors">
              {user.name}
            </h2>
            <p className="truncate text-[12px]">
              {isTyping ? (
                <span className="text-accent-soft">typing…</span>
              ) : user.online ? (
                <span className="text-online">Online</span>
              ) : (
                <span className="text-label-tertiary">
                  Last seen {user.lastSeen ?? 'recently'}
                </span>
              )}
            </p>
          </div>
        </Link>
        <IconButton label="Voice call" size="sm">
          <PhoneIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </IconButton>
        <IconButton label="Video call" size="sm">
          <VideoIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </IconButton>
      </header>

      <div
        ref={scrollRef}
        className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-6 md:px-8"
        aria-live="polite"
      >
        <div className="mx-auto max-w-3xl">
          <p className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-[12px] text-label-tertiary">
            <LockIcon className="h-3 w-3" strokeWidth={1.8} aria-hidden="true" />
            Messages are end-to-end encrypted
          </p>
          <p className="mt-6 text-center text-[12px] font-medium text-label-tertiary">
            Conversation History
          </p>
          {messages.map((message, i) => (
            <MessageBubble
              key={message.id}
              message={message}
              isFirstInGroup={i === 0 || messages[i - 1].from !== message.from}
              isLastInGroup={i === messages.length - 1 || messages[i + 1].from !== message.from}
              animateIn={i >= initialCount}
            />
          ))}
          <AnimatePresence>{isTyping && <TypingBubble />}</AnimatePresence>
        </div>
      </div>

      <div className="px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 md:px-6 md:pb-5">
        <div className="mx-auto max-w-3xl">
          <Composer onSend={send} onTyping={onTyping} recipient={user.name} />
        </div>
      </div>
    </div>
  );
}
