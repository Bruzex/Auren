import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircleIcon } from 'lucide-react';
import { Avatar } from './Avatar';
import type { User } from '../types/social';

type UserRowProps = {
  user: User;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  onSelect?: () => void;
  avatarSize?: number;
};

export function UserRow({ user, meta, trailing, onSelect, avatarSize = 48 }: UserRowProps) {
  const profileUrl = `/profile/${user.username || user.id}`;

  return (
    <div className="flex items-center gap-3 rounded-[18px] px-3 py-2.5 transition-colors hover:bg-white/[0.04]">
      {/* Avatar and name link to user's profile */}
      <Link
        to={profileUrl}
        aria-label={`View ${user.username}'s profile`}
        className="group flex min-w-0 flex-1 items-center gap-3.5 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <Avatar
          user={user}
          size={avatarSize}
          online={user.online}
          className="transition-transform duration-150 group-hover:scale-105"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-label transition-colors group-hover:text-accent-soft">
            {user.username}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-label-secondary">
            {user.name}
            {meta && <span className="text-label-tertiary"> · {meta}</span>}
          </span>
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            aria-label={`Message ${user.name}`}
            title="Message"
            className="glass-pill flex h-9 w-9 items-center justify-center rounded-full text-label-secondary transition-[background-color,color] duration-150 hover:bg-white/[0.1] hover:text-label focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <MessageCircleIcon className="h-4 w-4" strokeWidth={1.8} />
          </button>
        )}
        {trailing}
      </div>
    </div>
  );
}