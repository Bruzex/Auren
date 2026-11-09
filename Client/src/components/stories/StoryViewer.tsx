import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import {
  HeartIcon,
  SendIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  UsersIcon,
  Loader2Icon,
} from 'lucide-react';
import { Avatar } from '../Avatar';
import { storyService, StoryLikersResponse } from '../../services/stories';
import { useAuth } from '../../context/AuthContext';
import type { UserStoryGroup, Story, User } from '../../types/social';

type StoryViewerProps = {
  storyGroups: UserStoryGroup[];
  userIndex: number | null;
  onUserIndexChange: (index: number) => void;
  onClose: () => void;
  onViewed: (id: string) => void;
};

const DURATION = 5000;
const TICK = 50;

// Card transition variants for switching between different users
const userCardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 320 : -320,
    opacity: 0,
    scale: 0.92,
    rotateY: direction > 0 ? 12 : -12,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.28,
      ease: [0.23, 1, 0.32, 1],
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -320 : 320,
    opacity: 0,
    scale: 0.92,
    rotateY: direction > 0 ? -12 : 12,
    transition: {
      duration: 0.24,
      ease: [0.23, 1, 0.32, 1],
    },
  }),
};

export function StoryViewer({
  storyGroups,
  userIndex,
  onUserIndexChange,
  onClose,
  onViewed,
}: StoryViewerProps) {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  // Navigation state
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);

  // Likes state
  const [likesState, setLikesState] = useState<Record<string, { isLiked: boolean; count: number }>>({});
  const [showLikesSheet, setShowLikesSheet] = useState(false);
  const [likers, setLikers] = useState<StoryLikersResponse[]>([]);
  const [loadingLikers, setLoadingLikers] = useState(false);

  const currentGroup = userIndex !== null ? storyGroups[userIndex] : null;
  const stories = currentGroup?.stories || [];
  const currentStory: Story | null = stories[currentStoryIndex] || null;

  // Reset story index when active user group changes
  useEffect(() => {
    setCurrentStoryIndex(0);
    setProgress(0);
    setSent(false);
    setShowLikesSheet(false);
  }, [userIndex]);

  // Record view & initialize like state when active story changes
  useEffect(() => {
    if (!currentStory) return;
    setProgress(0);
    setSent(false);
    setShowLikesSheet(false);
    onViewed(currentStory.id);

    // Initialize like state from story object if not set
    setLikesState((prev) => {
      if (prev[currentStory.id] !== undefined) return prev;
      return {
        ...prev,
        [currentStory.id]: {
          isLiked: Boolean(currentStory.isLiked),
          count: currentStory.likesCount || 0,
        },
      };
    });
  }, [currentStory?.id, onViewed]);

  // Advance to next user
  const goToNextUser = useCallback(() => {
    if (userIndex === null) return;
    if (userIndex < storyGroups.length - 1) {
      setDirection(1);
      onUserIndexChange(userIndex + 1);
    } else {
      onClose();
    }
  }, [userIndex, storyGroups.length, onUserIndexChange, onClose]);

  // Go to previous user
  const goToPrevUser = useCallback(() => {
    if (userIndex === null) return;
    if (userIndex > 0) {
      setDirection(-1);
      onUserIndexChange(userIndex - 1);
    } else {
      setProgress(0);
    }
  }, [userIndex, onUserIndexChange]);

  // Advance story (within current user, or next user if user's stories finished)
  const goNextStory = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      goToNextUser();
    }
  }, [currentStoryIndex, stories.length, goToNextUser]);

  // Go back story (within current user, or previous user)
  const goPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      goToPrevUser();
    }
  }, [currentStoryIndex, goToPrevUser]);

  // Auto-progress timer
  useEffect(() => {
    if (userIndex === null || paused || showLikesSheet || !currentStory) return;

    const timer = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 1) {
          goNextStory();
          return 0;
        }
        return p + TICK / DURATION;
      });
    }, TICK);

    return () => window.clearInterval(timer);
  }, [userIndex, paused, showLikesSheet, currentStory, goNextStory]);

  // Keyboard navigation
  useEffect(() => {
    if (userIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLikesSheet) {
          setShowLikesSheet(false);
        } else {
          onClose();
        }
      }
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') goNextStory();
      if (e.key === 'ArrowLeft') goPrevStory();
      if (e.key === 'ArrowDown' && showLikesSheet) setShowLikesSheet(false);
      if (e.key === 'ArrowUp' && isStoryOwner) openLikesSheet();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Swipe gesture between users
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 60;
    if (info.offset.x < -threshold) {
      // Swiped left -> Next User
      goToNextUser();
    } else if (info.offset.x > threshold) {
      // Swiped right -> Previous User
      goToPrevUser();
    } else if (info.offset.y < -70 && isStoryOwner) {
      // Swiped up -> Open Likes Sheet
      openLikesSheet();
    }
  };

  // Like toggle handler
  const handleToggleLike = async () => {
    if (!currentStory) return;
    const storyId = currentStory.id;
    const current = likesState[storyId] || {
      isLiked: Boolean(currentStory.isLiked),
      count: currentStory.likesCount || 0,
    };

    const nextLiked = !current.isLiked;
    const nextCount = Math.max(0, current.count + (nextLiked ? 1 : -1));

    // Optimistic UI update
    setLikesState((prev) => ({
      ...prev,
      [storyId]: { isLiked: nextLiked, count: nextCount },
    }));

    try {
      const res = await storyService.likeStory(storyId);
      setLikesState((prev) => ({
        ...prev,
        [storyId]: { isLiked: res.isLiked, count: res.likesCount },
      }));
    } catch {
      // Revert on error
      setLikesState((prev) => ({
        ...prev,
        [storyId]: current,
      }));
    }
  };

  // Open likes sheet for story owner
  const openLikesSheet = async () => {
    if (!currentStory) return;
    setShowLikesSheet(true);
    setLoadingLikers(true);
    try {
      const data = await storyService.getStoryLikes(currentStory.id);
      setLikers(data);
    } catch (err) {
      console.warn('Failed to load story likes:', err);
    } finally {
      setLoadingLikers(false);
    }
  };

  const sendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setReply('');
    setSent(true);
    setPaused(false);
  };

  if (userIndex === null || !currentGroup || !currentStory) return null;

  const storyOwner = currentGroup.user;
  const isStoryOwner =
    authUser?.id &&
    (currentGroup.userId === authUser.id || currentStory.userId === authUser.id);
  const activeLikes = likesState[currentStory.id] || {
    isLiked: Boolean(currentStory.isLiked),
    count: currentStory.likesCount || 0,
  };
  const isGradient =
    currentStory.image?.startsWith('linear-gradient') ||
    currentStory.image?.startsWith('radial-gradient');

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Story viewer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl"
      >
        {/* Previous User Arrow (Desktop / Tablet) */}
        {userIndex > 0 && (
          <button
            type="button"
            onClick={goToPrevUser}
            aria-label="Previous user stories"
            className="hidden md:flex absolute left-6 z-20 h-12 w-12 items-center justify-center rounded-full glass border border-white/10 text-white/80 transition-all hover:bg-white/[0.15] hover:text-white hover:scale-105 active:scale-95"
          >
            <ChevronLeftIcon className="h-6 w-6" strokeWidth={2} />
          </button>
        )}

        {/* Next User Arrow (Desktop / Tablet) */}
        {userIndex < storyGroups.length - 1 && (
          <button
            type="button"
            onClick={goToNextUser}
            aria-label="Next user stories"
            className="hidden md:flex absolute right-6 z-20 h-12 w-12 items-center justify-center rounded-full glass border border-white/10 text-white/80 transition-all hover:bg-white/[0.15] hover:text-white hover:scale-105 active:scale-95"
          >
            <ChevronRightIcon className="h-6 w-6" strokeWidth={2} />
          </button>
        )}

        {/* Story Card Container with Swiping & User Transitions */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentGroup.userId}
            custom={direction}
            variants={userCardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="relative h-[100dvh] w-full overflow-hidden bg-surface md:aspect-[9/16] md:h-[min(92vh,860px)] md:w-auto md:rounded-[32px] md:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
          >
            {/* Story Media */}
            {isGradient ? (
              <div
                className="absolute inset-0 h-full w-full"
                style={{ backgroundImage: currentStory.image }}
              />
            ) : (
              <img
                src={currentStory.image}
                alt={currentStory.caption ?? `${storyOwner.name}'s story`}
                className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
              />
            )}

            {/* Top & Bottom Ambient Gradients */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/70 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/80 to-transparent"
              aria-hidden="true"
            />

            {/* Header: Progress Bars & User Info */}
            <div className="absolute inset-x-0 top-0 z-20 px-3 pt-[max(env(safe-area-inset-top),12px)]">
              {/* Progress bar per user: divided ONLY by current user's stories count */}
              <div className="flex gap-1" aria-hidden="true">
                {stories.map((s, i) => (
                  <span
                    key={s.id}
                    className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25 backdrop-blur-sm"
                  >
                    <span
                      className="block h-full rounded-full bg-white transition-[width] duration-75"
                      style={{
                        width: `${
                          i < currentStoryIndex
                            ? 100
                            : i === currentStoryIndex
                            ? progress * 100
                            : 0
                        }%`,
                      }}
                    />
                  </span>
                ))}
              </div>

              {/* User row & Close button */}
              <div className="mt-3 flex items-center justify-between gap-3 px-1">
                <Link
                  to={`/profile/${storyOwner.username || storyOwner.id}`}
                  onClick={onClose}
                  className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-full hover:opacity-90 transition-opacity focus-visible:outline-none"
                >
                  <Avatar user={storyOwner} size={34} online={storyOwner.online} />
                  <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-white group-hover:text-accent-soft transition-colors">
                    {storyOwner.username}
                    <span className="ml-2 font-normal text-white/60">
                      {currentStory.postedAgo}
                    </span>
                  </p>
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close story"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors duration-150 hover:bg-black/55 focus-visible:outline-none"
                >
                  <XIcon className="h-5 w-5" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            {/* Tap areas for previous/next story */}
            <button
              type="button"
              aria-label="Previous story"
              onClick={goPrevStory}
              className="absolute bottom-28 left-0 top-24 w-1/3 z-10 focus-visible:outline-none"
            />
            <button
              type="button"
              aria-label="Next story"
              onClick={goNextStory}
              className="absolute bottom-28 right-0 top-24 w-2/3 z-10 focus-visible:outline-none"
            />

            {/* Story Caption */}
            {currentStory.caption && (
              <p className="pointer-events-none absolute inset-x-6 bottom-32 z-10 text-center font-display text-[28px] italic leading-tight text-white drop-shadow-lg">
                {currentStory.caption}
              </p>
            )}

            {/* Bottom Controls */}
            <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-[max(env(safe-area-inset-bottom),14px)]">
              {/* For Story Owner: Likes Bar / Tap to Open Likes Sheet */}
              {isStoryOwner ? (
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={openLikesSheet}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="glass flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[13px] font-medium text-white shadow-lg backdrop-blur-xl transition-colors hover:bg-white/[0.15]"
                  >
                    <HeartIcon
                      className={`h-4 w-4 ${
                        activeLikes.count > 0 ? 'fill-[#FF4B72] text-[#FF4B72]' : 'text-white'
                      }`}
                      strokeWidth={2}
                    />
                    <span>
                      {activeLikes.count === 1
                        ? '1 like'
                        : `${activeLikes.count} likes`}
                    </span>
                    <ChevronUpIcon className="h-4 w-4 text-label-tertiary" />
                  </motion.button>
                </div>
              ) : (
                /* For Other Viewers: Reply Input + Heart Like Button */
                <form
                  onSubmit={sendReply}
                  className="flex items-center gap-2"
                >
                  <label className="flex h-12 flex-1 items-center rounded-full border border-white/20 bg-black/35 px-5 backdrop-blur-xl focus-within:border-accent/50">
                    <span className="sr-only">Reply to {storyOwner.username}</span>
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onFocus={() => setPaused(true)}
                      onBlur={() => setPaused(false)}
                      placeholder={sent ? 'Reply sent' : `Reply to ${storyOwner.username}…`}
                      className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/60"
                    />
                  </label>

                  {reply.trim() ? (
                    <button
                      type="submit"
                      aria-label="Send reply"
                      className="btn-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95"
                    >
                      <SendIcon className="h-5 w-5" strokeWidth={1.8} />
                    </button>
                  ) : (
                    <motion.button
                      type="button"
                      aria-label={activeLikes.isLiked ? 'Unlike story' : 'Like story'}
                      aria-pressed={activeLikes.isLiked}
                      whileTap={{ scale: 0.82 }}
                      onClick={handleToggleLike}
                      className="glass flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/[0.15]"
                    >
                      <HeartIcon
                        className={`h-6 w-6 transition-colors duration-150 ${
                          activeLikes.isLiked
                            ? 'fill-[#FF4B72] text-[#FF4B72] drop-shadow-[0_0_10px_rgba(255,75,114,0.5)]'
                            : 'text-white'
                        }`}
                        strokeWidth={1.8}
                      />
                    </motion.button>
                  )}
                </form>
              )}
            </div>

            {/* Story Owner Likes Bottom Sheet */}
            <AnimatePresence>
              {showLikesSheet && (
                <div className="absolute inset-0 z-40 flex flex-col justify-end">
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowLikesSheet(false)}
                  />

                  {/* Sheet Card */}
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                    className="glass-strong relative z-10 max-h-[70%] w-full rounded-t-[32px] border-t border-white/15 p-5 shadow-2xl backdrop-blur-2xl flex flex-col"
                  >
                    {/* Pull Handle */}
                    <div className="mx-auto h-1 w-12 rounded-full bg-white/20 mb-3" />

                    <div className="flex items-center justify-between pb-3 border-b border-hairline">
                      <div className="flex items-center gap-2">
                        <HeartIcon className="h-5 w-5 fill-[#FF4B72] text-[#FF4B72]" />
                        <h3 className="text-[17px] font-semibold text-white">
                          Likes ({activeLikes.count})
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLikesSheet(false)}
                        className="rounded-full p-1.5 text-label-secondary hover:text-white"
                      >
                        <XIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Likers List */}
                    <div className="thin-scroll mt-3 flex-1 overflow-y-auto min-h-[160px] max-h-[300px]">
                      {loadingLikers ? (
                        <div className="flex h-36 items-center justify-center">
                          <Loader2Icon className="h-6 w-6 animate-spin text-accent-soft" />
                        </div>
                      ) : likers.length > 0 ? (
                        <ul className="divide-y divide-hairline">
                          {likers.map((user) => (
                            <li key={user.id} className="py-2.5">
                              <Link
                                to={`/profile/${user.username || user.id}`}
                                onClick={onClose}
                                className="group flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/[0.06]"
                              >
                                <Avatar user={user} size={42} online={user.online} />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[15px] font-semibold text-white group-hover:text-accent-soft transition-colors">
                                    {user.name}
                                  </p>
                                  <p className="truncate text-[13px] text-label-secondary">
                                    @{user.username}
                                  </p>
                                </div>
                                <HeartIcon className="h-4 w-4 fill-[#FF4B72] text-[#FF4B72] shrink-0 mr-1" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex h-36 flex-col items-center justify-center text-center px-4">
                          <HeartIcon className="h-8 w-8 text-white/20 mb-2" />
                          <p className="text-[14px] font-medium text-label-secondary">
                            No likes yet
                          </p>
                          <p className="text-[12px] text-label-tertiary mt-0.5">
                            When people like your story, they'll appear here.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
