import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchIcon, UserRoundSearchIcon, XIcon, Loader2Icon } from 'lucide-react';
import { UserRow } from '../components/UserRow';
import { FollowButton } from '../components/FollowButton';
import { IconButton } from '../components/IconButton';
import { EmptyState } from '../components/EmptyState';
import { userService, SearchUserResult } from '../services/users';
import { chatService } from '../services/chat';
import { cacheUser } from '../utils/users';
import type { FollowStatus, User } from '../types/social';

export function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchUserResult[]>([]);
  const [suggested, setSuggested] = useState<SearchUserResult[]>([]);
  const [recents, setRecents] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('auren_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [followMap, setFollowMap] = useState<Record<string, FollowStatus>>({});
  const [notice, setNotice] = useState<string | null>(null);

  // Load suggested users on mount
  useEffect(() => {
    userService
      .getSuggestedUsers()
      .then((users) => {
        setSuggested(users);
        const initialMap: Record<string, FollowStatus> = {};
        users.forEach((u) => {
          initialMap[u.id] = u.followStatus;
          cacheUser(u);
        });
        setFollowMap((prev) => ({ ...initialMap, ...prev }));
      })
      .catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const users = await userService.searchUsers(q);
        setResults(users);
        const mapUpdates: Record<string, FollowStatus> = {};
        users.forEach((u) => {
          mapUpdates[u.id] = u.followStatus;
          cacheUser(u);
        });
        setFollowMap((prev) => ({ ...prev, ...mapUpdates }));
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const toggle = async (id: string) => {
    const current = followMap[id] || 'follow';
    // Optimistic toggle
    const optimisticNext: FollowStatus =
      current === 'following' ? 'follow' : current === 'follow' ? 'following' : 'follow';
    setFollowMap((prev) => ({ ...prev, [id]: optimisticNext }));

    try {
      const realStatus = await userService.toggleFollow(id);
      setFollowMap((prev) => ({ ...prev, [id]: realStatus }));
    } catch {
      // Revert on error
      setFollowMap((prev) => ({ ...prev, [id]: current }));
    }
  };

  const handleStartChat = async (targetUser: User) => {
    handleAddRecent(targetUser);
    try {
      const conv = await chatService.getOrCreateConversation(targetUser.id);
      navigate(`/chats/${conv.id}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'You need to follow each other first before starting a chat.';
      setNotice(msg);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const handleSelectRecent = (user: User) => {
    setQuery(user.username);
  };

  const handleAddRecent = (user: User) => {
    setRecents((prev) => {
      const filtered = prev.filter((u) => u.id !== user.id);
      const next = [user, ...filtered].slice(0, 10);
      localStorage.setItem('auren_recent_searches', JSON.stringify(next));
      return next;
    });
  };

  const handleRemoveRecent = (userId: string) => {
    setRecents((prev) => {
      const next = prev.filter((u) => u.id !== userId);
      localStorage.setItem('auren_recent_searches', JSON.stringify(next));
      return next;
    });
  };

  const handleClearRecents = () => {
    setRecents([]);
    localStorage.removeItem('auren_recent_searches');
  };

  const followButton = (id: string, name: string) => (
    <FollowButton
      status={followMap[id] ?? 'follow'}
      onToggle={() => toggle(id)}
      name={name}
    />
  );

  const q = query.trim();

  return (
    <div className="relative mx-auto w-full max-w-[720px] px-5 pb-32 pt-[max(env(safe-area-inset-top),24px)] md:px-8 md:pb-12 md:pt-10">
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full glass-strong px-5 py-2.5 text-[14px] font-medium text-white shadow-2xl ring-1 ring-white/15"
          >
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span>{notice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.028em] md:text-[34px]">
        Search
      </h1>

      <div className="sticky top-0 z-20 -mx-5 mt-5 bg-canvas/70 px-5 pb-4 pt-3 backdrop-blur-xl md:static md:mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <label className="glass flex h-14 items-center gap-3 rounded-full px-5 transition-[box-shadow,border-color] duration-200 focus-within:border-accent/40 focus-within:shadow-[0_0_0_4px_rgba(90,130,255,0.16),inset_0_1px_0_rgba(255,255,255,0.08)]">
          {loading ? (
            <Loader2Icon className="h-5 w-5 shrink-0 animate-spin text-accent-soft" />
          ) : (
            <SearchIcon
              className="h-5 w-5 shrink-0 text-label-tertiary"
              strokeWidth={1.7}
              aria-hidden="true"
            />
          )}
          <span className="sr-only">Search people</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[17px] text-label outline-none placeholder:text-label-tertiary"
          />

          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.14] text-label"
              >
                <XIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
              </motion.button>
            )}
          </AnimatePresence>
        </label>
      </div>

      {q ? (
        <section aria-label="Results" className="mt-4">
          <p className="mb-3 px-1 text-[13px] text-label-tertiary" aria-live="polite">
            {results.length} {results.length === 1 ? 'person' : 'people'}
          </p>
          {results.length > 0 ? (
            <div className="glass rounded-[26px] p-2">
              {results.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  meta={u.mutuals ? `${u.mutuals} mutual` : undefined}
                  onSelect={() => handleStartChat(u)}
                  trailing={followButton(u.id, u.name)}
                />
              ))}
            </div>
          ) : (
            !loading && (
              <EmptyState
                icon={UserRoundSearchIcon}
                title={`No one found for “${q}”`}
                body="Check the spelling, or try searching by exact username."
              />
            )
          )}
        </section>
      ) : (
        <>
          <section aria-labelledby="recent-heading" className="mt-4">
            <div className="mb-3 flex items-baseline justify-between px-1">
              <h2
                id="recent-heading"
                className="text-[17px] font-semibold tracking-[-0.015em]"
              >
                Recent
              </h2>
              {recents.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearRecents}
                  className="text-[14px] text-accent-soft transition-colors duration-150 hover:text-label"
                >
                  Clear all
                </button>
              )}
            </div>
            {recents.length > 0 ? (
              <ul className="glass rounded-[26px] p-2">
                <AnimatePresence initial={false}>
                  {recents.map((user) => (
                    <motion.li
                      key={user.id}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden"
                    >
                      <UserRow
                        user={user}
                        onSelect={() => handleSelectRecent(user)}
                        trailing={
                          <IconButton
                            label={`Remove ${user.username} from recent`}
                            size="sm"
                            className="border-transparent bg-transparent shadow-none"
                            onClick={() => handleRemoveRecent(user.id)}
                          >
                            <XIcon className="h-4 w-4" strokeWidth={1.7} />
                          </IconButton>
                        }
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <p className="px-1 text-[14px] text-label-tertiary">No recent searches.</p>
            )}
          </section>

          <section aria-labelledby="suggested-heading" className="mt-10">
            <h2
              id="suggested-heading"
              className="mb-3 px-1 text-[17px] font-semibold tracking-[-0.015em]"
            >
              Suggested for you
            </h2>
            <div className="glass rounded-[26px] p-2">
              {suggested.length > 0 ? (
                suggested.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    meta={u.mutuals ? `${u.mutuals} mutual` : undefined}
                    onSelect={() => handleStartChat(u)}
                    trailing={followButton(u.id, u.name)}
                  />
                ))
              ) : (
                <p className="p-4 text-center text-[13px] text-label-tertiary">
                  All suggested accounts followed!
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
