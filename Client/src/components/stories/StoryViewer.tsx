import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartIcon, SendIcon, XIcon } from 'lucide-react';
import { Avatar } from '../Avatar';
import { getUser } from '../../utils/users';
import type { Story, User } from '../../types/social';

type StoryViewerProps = {
  stories: Story[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onViewed: (id: string) => void;
};

const DURATION = 5000;
const TICK = 50;

export function StoryViewer({
  stories,
  index,
  onIndexChange,
  onClose,
  onViewed,
}: StoryViewerProps) {
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState('');
  const [liked, setLiked] = useState(false);
  const [sent, setSent] = useState(false);
  const story = index !== null ? stories[index] : null;

  useEffect(() => {
    if (index === null || !stories[index]) return;
    setProgress(0);
    setLiked(false);
    setSent(false);
    onViewed(stories[index].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (index === null || paused) return;
    const id = window.setInterval(
      () => setProgress((p) => Math.min(1, p + TICK / DURATION)),
      TICK
    );
    return () => window.clearInterval(id);
  }, [index, paused]);

  const goNext = () => {
    if (index === null) return;
    if (index < stories.length - 1) onIndexChange(index + 1);
    else onClose();
  };
  const goPrev = () => {
    if (index === null) return;
    if (index > 0) onIndexChange(index - 1);
    else setProgress(0);
  };

  useEffect(() => {
    if (progress >= 1) goNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const sendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setReply('');
    setSent(true);
    setPaused(false);
  };

  if (!story || index === null) return null;
  const user: User = (story as any).user || getUser(story.userId);
  const isGradient = story.image?.startsWith('linear-gradient') || story.image?.startsWith('radial-gradient');

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Story viewer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="relative h-[100dvh] w-full overflow-hidden bg-surface md:aspect-[9/16] md:h-[min(92vh,860px)] md:w-auto md:rounded-[32px] md:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
        >
          {isGradient ? (
            <div
              className="absolute inset-0 h-full w-full"
              style={{ backgroundImage: story.image }}
            />
          ) : (
            <img
              src={story.image}
              alt={story.caption ?? `${user.name}'s story`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <div
            className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent"
            aria-hidden="true"
          />

          <div className="absolute inset-x-0 top-0 z-10 px-3 pt-[max(env(safe-area-inset-top),12px)]">
            <div className="flex gap-1" aria-hidden="true">
              {stories.map((s, i) => (
                <span key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
                  <span
                    className="block h-full rounded-full bg-white"
                    style={{
                      width: `${i < index ? 100 : i === index ? progress * 100 : 0}%`,
                    }}
                  />
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 px-1">
              <Link
                to={`/profile/${user.username || user.id}`}
                onClick={onClose}
                className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-full hover:opacity-90 transition-opacity focus-visible:outline-none"
              >
                <Avatar user={user} size={34} />
                <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-white group-hover:text-accent-soft transition-colors">
                  {user.username}
                  <span className="ml-2 font-normal text-white/60">{story.postedAgo}</span>
                </p>
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close story"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md transition-colors duration-150 hover:bg-black/40"
              >
                <XIcon className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <button
            type="button"
            aria-label="Previous story"
            onClick={goPrev}
            className="absolute bottom-28 left-0 top-24 w-1/3 focus-visible:outline-none"
          />
          <button
            type="button"
            aria-label="Next story"
            onClick={goNext}
            className="absolute bottom-28 right-0 top-24 w-2/3 focus-visible:outline-none"
          />

          {story.caption && (
            <p className="pointer-events-none absolute inset-x-6 bottom-28 text-center font-display text-[30px] italic leading-tight text-white drop-shadow-md">
              {story.caption}
            </p>
          )}

          <form
            onSubmit={sendReply}
            className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-2 px-3 pb-[max(env(safe-area-inset-bottom),14px)]"
          >
            <label className="flex h-12 flex-1 items-center rounded-full border border-white/20 bg-black/25 px-5 backdrop-blur-xl">
              <span className="sr-only">Reply to {user.username}</span>
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                placeholder={sent ? 'Reply sent' : `Reply to ${user.username}…`}
                className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/60"
              />
            </label>
            {reply.trim() ? (
              <button
                type="submit"
                aria-label="Send reply"
                className="btn-accent flex h-12 w-12 items-center justify-center rounded-full"
              >
                <SendIcon className="h-5 w-5" strokeWidth={1.8} />
              </button>
            ) : (
              <motion.button
                type="button"
                aria-label={liked ? 'Unlike story' : 'Like story'}
                aria-pressed={liked}
                whileTap={{ scale: 0.85 }}
                onClick={() => setLiked((v) => !v)}
                className="flex h-12 w-12 items-center justify-center rounded-full text-white"
              >
                <HeartIcon
                  className={`h-6 w-6 transition-colors duration-150 ${
                    liked ? 'fill-[#FF7A9A] text-[#FF7A9A]' : ''
                  }`}
                  strokeWidth={1.7}
                />
              </motion.button>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
