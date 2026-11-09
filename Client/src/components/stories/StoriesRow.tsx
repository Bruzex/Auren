import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { useAuth } from '../../context/AuthContext';
import type { UserStoryGroup, User } from '../../types/social';

type StoriesRowProps = {
  storyGroups: UserStoryGroup[];
  onOpen: (userIndex: number) => void;
};

const AVATAR = 72;

export function StoriesRow({ storyGroups, onOpen }: StoriesRowProps) {
  const { user: authUser } = useAuth();
  const currentUser: User = authUser || {
    id: 'me',
    name: 'You',
    username: 'you',
  };

  const myGroupIndex = storyGroups.findIndex((g) => g.userId === authUser?.id);
  const myGroup = myGroupIndex !== -1 ? storyGroups[myGroupIndex] : null;

  return (
    <ul className="no-scrollbar flex gap-4 overflow-x-auto px-5 py-1 md:px-1">
      {/* Current User Story Circle */}
      <li className="shrink-0">
        <div className="flex w-[76px] flex-col items-center gap-2">
          {myGroup && myGroup.stories.length > 0 ? (
            <div className="relative block">
              <button
                type="button"
                onClick={() => onOpen(myGroupIndex)}
                aria-label="View your story"
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <motion.span whileTap={{ scale: 0.94 }} className="block">
                  <Avatar
                    user={currentUser}
                    size={AVATAR}
                    ring={myGroup.allViewed ? 'seen' : 'unseen'}
                  />
                </motion.span>
              </button>
              <Link
                to="/story/new"
                aria-label="Add new story"
                className="btn-accent absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full ring-[3px] ring-canvas transition-transform hover:scale-110 active:scale-95"
              >
                <PlusIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
              </Link>
            </div>
          ) : (
            <Link
              to="/story/new"
              aria-label="Create a story"
              className="flex flex-col items-center gap-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <motion.span whileTap={{ scale: 0.94 }} className="relative block">
                <Avatar user={currentUser} size={AVATAR} ring="seen" />
                <span className="btn-accent absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full ring-[3px] ring-canvas">
                  <PlusIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
              </motion.span>
            </Link>
          )}
          <span className="w-full truncate text-center text-[12px] text-label-secondary">
            Your story
          </span>
        </div>
      </li>

      {/* Other Users' Independent Story Groups */}
      {storyGroups.map((group, index) => {
        if (group.userId === authUser?.id) return null;
        return (
          <li key={group.userId} className="shrink-0">
            <button
              type="button"
              onClick={() => onOpen(index)}
              aria-label={`View ${group.user.name}'s story${group.allViewed ? '' : ', new'}`}
              className="flex w-[76px] flex-col items-center gap-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <motion.span
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.12 }}
                className="block"
              >
                <Avatar
                  user={group.user}
                  size={AVATAR}
                  ring={group.allViewed ? 'seen' : 'unseen'}
                />
              </motion.span>
              <span
                className={`w-full truncate text-center text-[12px] ${
                  group.allViewed ? 'text-label-tertiary' : 'text-label font-medium'
                }`}
              >
                {group.user.username}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
