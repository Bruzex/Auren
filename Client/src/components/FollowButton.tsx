import React from 'react';
import { buttonStyles } from './Button';
import type { FollowStatus } from '../types/social';

type FollowButtonProps = {
  status: FollowStatus;
  onToggle: () => void;
  name: string;
};

const labels: Record<FollowStatus, string> = {
  follow: 'Follow',
  requested: 'Requested',
  following: 'Following'
};

export function FollowButton({ status, onToggle, name }: FollowButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${labels[status]} ${name}`}
      aria-pressed={status !== 'follow'}
      className={`${buttonStyles(status === 'follow' ? 'primary' : 'glass', 'sm')} min-w-[104px] ${
      status === 'requested' ? 'text-label-secondary' : ''}`
      }>
      
      {labels[status]}
    </button>);

}

export function nextFollowStatus(status: FollowStatus): FollowStatus {
  return status === 'follow' ? 'requested' : 'follow';
}