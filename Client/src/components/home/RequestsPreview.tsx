import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { userService } from '../../services/users';
import type { FollowRequest, User } from '../../types/social';

export function RequestsPreview() {
  const [requests, setRequests] = useState<FollowRequest[]>([]);

  useEffect(() => {
    let mounted = true;
    userService
      .getPendingRequests()
      .then((data) => {
        if (mounted) setRequests(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (requests.length === 0) return null;

  const firstUser: User = requests[0].user || {
    id: requests[0].userId,
    name: requests[0].userId,
    username: requests[0].userId,
  };

  return (
    <Link
      to="/notifications"
      className="glass group flex items-center gap-4 rounded-[24px] p-5 transition-colors duration-150 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      <span className="flex -space-x-3">
        {requests.slice(0, 3).map((r) => {
          const u: User = r.user || {
            id: r.userId,
            name: r.userId,
            username: r.userId,
          };
          return (
            <span key={r.id} className="rounded-full ring-[3px] ring-[#121218]">
              <Avatar user={u} size={36} />
            </span>
          );
        })}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">Follow requests</span>
        <span className="mt-0.5 block truncate text-[13px] text-label-secondary">
          {firstUser.username}{' '}
          {requests.length > 1 ? `and ${requests.length - 1} others` : 'wants to follow you'}
        </span>
      </span>
      <ChevronRightIcon
        className="h-5 w-5 text-label-tertiary transition-transform duration-150 ease-out-expo group-hover:translate-x-0.5"
        strokeWidth={1.6}
      />
    </Link>
  );
}
