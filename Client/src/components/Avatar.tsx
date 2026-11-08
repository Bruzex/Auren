import React from 'react';
import { getInitials } from '../utils/users';
import type { User } from '../types/social';

type AvatarProps = {
  user: User;
  size?: number;
  online?: boolean;
  ring?: 'unseen' | 'seen' | 'none';
  className?: string;
};

export function Avatar({ user, size = 48, online = false, ring = 'none', className = '' }: AvatarProps) {
  const hasRing = ring !== 'none';
  const ringWidth = hasRing ? Math.max(2, Math.round(size * 0.035)) : 0;
  const gap = hasRing ? Math.max(2, Math.round(size * 0.04)) : 0;
  const dot = Math.max(10, Math.round(size * 0.22));

  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      {hasRing &&
      <span
        aria-hidden="true"
        className={`absolute inset-0 rounded-full ${ring === 'unseen' ? 'story-ring' : 'bg-white/[0.14]'}`} />

      }
      {hasRing && <span aria-hidden="true" className="absolute rounded-full bg-canvas" style={{ inset: ringWidth }} />}
      <span className="absolute overflow-hidden rounded-full" style={{ inset: ringWidth + gap }}>
        {user.avatar ?
        <img src={user.avatar} alt="" className="h-full w-full object-cover" draggable={false} /> :

        <span
          className="flex h-full w-full items-center justify-center bg-white/[0.07] font-medium text-label-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          style={{ fontSize: Math.round(size * 0.34) }}>
          
            {getInitials(user.name)}
          </span>
        }
      </span>
      {online &&
      <span
        aria-label="Online"
        className="glow-online absolute rounded-full bg-online"
        style={{ width: dot, height: dot, right: hasRing ? ringWidth : size * 0.02, bottom: hasRing ? ringWidth : size * 0.02 }} />

      }
    </span>);

}