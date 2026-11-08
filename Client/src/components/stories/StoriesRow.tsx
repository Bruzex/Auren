import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { useAuth } from '../../context/AuthContext';
import { getUser } from '../../utils/users';
import type { Story, User } from '../../types/social';

type StoriesRowProps = {
  stories: Story[];
  onOpen: (index: number) => void;
};

const AVATAR = 72;

export function StoriesRow({ stories, onOpen }: StoriesRowProps) {
  const { user: authUser } = useAuth();
  const currentUser: User = authUser || {
    id: 'me',
    name: 'You',
    username: 'you',
  };

  return (
    <ul className="no-scrollbar flex gap-4 overflow-x-auto px-5 py-1 md:px-1">
      <li className="shrink-0">
        <Link
          to="/story/new"
          className="flex w-[76px] flex-col items-center gap-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <motion.span whileTap={{ scale: 0.94 }} className="relative block">
            <Avatar user={currentUser} size={AVATAR} ring="seen" />
            <span className="btn-accent absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full ring-[3px] ring-canvas">
              <PlusIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
          </motion.span>
          <span className="w-full truncate text-center text-[12px] text-label-secondary">
            Your story
          </span>
        </Link>
      </li>
      {stories.map((story, index) => {
        const user: User = (story as any).user || getUser(story.userId);
        return (
          <li key={story.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onOpen(index)}
              aria-label={`View ${user.name}'s story${story.viewed ? '' : ', new'}`}
              className="flex w-[76px] flex-col items-center gap-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <motion.span
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.12 }}
                className="block"
              >
                <Avatar user={user} size={AVATAR} ring={story.viewed ? 'seen' : 'unseen'} />
              </motion.span>
              <span
                className={`w-full truncate text-center text-[12px] ${
                  story.viewed ? 'text-label-tertiary' : 'text-label'
                }`}
              >
                {user.username}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
