import React from 'react';
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
  const body =
  <>
      <Avatar user={user} size={avatarSize} online={user.online} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-label">{user.username}</span>
        <span className="mt-0.5 block truncate text-[13px] text-label-secondary">
          {user.name}
          {meta && <span className="text-label-tertiary"> · {meta}</span>}
        </span>
      </span>
    </>;


  return (
    <div className="flex items-center gap-3 rounded-[18px] px-3 py-2.5">
      {onSelect ?
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3.5 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
        
          {body}
        </button> :

      <div className="flex min-w-0 flex-1 items-center gap-3.5">{body}</div>
      }
      {trailing}
    </div>);

}