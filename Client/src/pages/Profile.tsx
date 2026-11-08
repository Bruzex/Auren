import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckIcon,
  EyeIcon,
  ImageOffIcon,
  LockIcon,
  PlusIcon,
  ShareIcon,
  LogOutIcon,
  MessageCircleIcon,
  Loader2Icon,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { SegmentedControl } from '../components/SegmentedControl';
import { EmptyState } from '../components/EmptyState';
import { EditProfileSheet } from '../components/profile/EditProfileSheet';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/stories';
import { userService, UserProfileResponse } from '../services/users';
import { chatService } from '../services/chat';
import type { ArchivedStory, FollowStatus, User } from '../types/social';

type Tab = 'active' | 'archive';

const tabs = [
  { value: 'active', label: 'Active' },
  { value: 'archive', label: 'Archive' },
] as const;

export function Profile() {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const { user: authUser, stats: myStats, updateProfile, logout } = useAuth();

  const isSelf = !username || username === authUser?.username || username === authUser?.id;

  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>('active');
  const [stories, setStories] = useState<ArchivedStory[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  // Other user state
  const [targetProfile, setTargetProfile] = useState<UserProfileResponse | null>(null);
  const [targetLoading, setTargetLoading] = useState(!isSelf);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus>('follow');

  // Load target user profile if not self
  useEffect(() => {
    if (isSelf || !username) {
      setTargetLoading(false);
      return;
    }

    let mounted = true;
    setTargetLoading(true);
    setTargetError(null);

    userService
      .getUserProfile(username)
      .then((data) => {
        if (!mounted) return;
        setTargetProfile(data);
        setFollowStatus(data.followStatus);
        // Load target user's stories
        return storyService.getUserStories(data.id);
      })
      .then((userStories) => {
        if (mounted && userStories) {
          setStories(userStories);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.warn('Failed to load user profile:', err);
        setTargetError('User not found or unavailable');
      })
      .finally(() => {
        if (mounted) setTargetLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isSelf, username]);

  // Load own stories if viewing self
  const loadOwnStories = useCallback(async () => {
    if (!isSelf || !authUser?.id) return;
    try {
      const data = await storyService.getUserStories(authUser.id);
      setStories(data);
    } catch (err) {
      console.warn('Failed to load user stories:', err);
    }
  }, [isSelf, authUser?.id]);

  useEffect(() => {
    if (isSelf) {
      loadOwnStories();
    }
  }, [isSelf, loadOwnStories]);

  // Toggle follow for other user
  const handleToggleFollow = async () => {
    if (!targetProfile) return;
    const current = followStatus;
    const optimisticNext: FollowStatus =
      current === 'following' ? 'follow' : current === 'follow' ? 'following' : 'follow';

    setFollowStatus(optimisticNext);
    setTargetProfile((prev) => {
      if (!prev) return null;
      const countDiff = optimisticNext === 'following' ? 1 : current === 'following' ? -1 : 0;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          followersCount: Math.max(0, prev.stats.followersCount + countDiff),
        },
      };
    });

    try {
      const realStatus = await userService.toggleFollow(targetProfile.id);
      setFollowStatus(realStatus);
    } catch {
      setFollowStatus(current);
    }
  };

  // Start chat with mutual follow restriction
  const handleStartChat = async () => {
    if (!targetProfile) return;
    try {
      const conv = await chatService.getOrCreateConversation(targetProfile.id);
      navigate(`/chats/${conv.id}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'You need to follow each other first before starting a chat.';
      setNotice(msg);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const closeSheet = useCallback(() => setEditing(false), []);

  const share = () => {
    const handle = isSelf ? authUser?.username : targetProfile?.username;
    if (handle) {
      navigator.clipboard?.writeText(`https://auren.app/${handle}`).catch(() => undefined);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  if (targetLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-accent-soft" />
      </div>
    );
  }

  if (targetError) {
    return (
      <div className="mx-auto flex h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-[20px] font-semibold text-label">User Not Found</p>
        <p className="mt-2 text-[14px] text-label-secondary">{targetError}</p>
        <Button variant="glass" size="md" className="mt-6" onClick={() => navigate('/search')}>
          Search other users
        </Button>
      </div>
    );
  }

  const currentUser: User = isSelf
    ? authUser || {
        id: 'unknown',
        name: 'Unknown',
        username: 'unknown',
      }
    : {
        id: targetProfile?.id || '',
        name: targetProfile?.name || 'User',
        username: targetProfile?.username || 'user',
        avatar: targetProfile?.avatar,
        bio: targetProfile?.bio,
        online: targetProfile?.online,
        lastSeen: targetProfile?.lastSeen,
      };

  const displayStats = isSelf
    ? [
        { label: 'Followers', value: myStats?.followersCount ?? 0 },
        { label: 'Following', value: myStats?.followingCount ?? 0 },
        { label: 'Stories', value: myStats?.storiesCount ?? stories.length },
      ]
    : [
        { label: 'Followers', value: targetProfile?.stats?.followersCount ?? 0 },
        { label: 'Following', value: targetProfile?.stats?.followingCount ?? 0 },
        { label: 'Stories', value: targetProfile?.stats?.storiesCount ?? stories.length },
      ];

  const items = stories.filter((s) => (tab === 'active' ? s.active : !s.active));

  return (
    <div className="relative mx-auto w-full max-w-[880px] px-5 pb-32 pt-[max(env(safe-area-inset-top),32px)] md:px-8 md:pb-12 md:pt-14">
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

      <section className="flex flex-col items-center text-center md:flex-row md:items-center md:gap-12 md:text-left">
        <div className="glass shrink-0 rounded-full p-2">
          <Avatar user={currentUser} size={132} online={currentUser.online} />
        </div>
        <div className="mt-6 min-w-0 flex-1 md:mt-0">
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.028em]">
            {currentUser.name}
          </h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-[15px] text-label-secondary md:justify-start">
            @{currentUser.username}
            {(isSelf || targetProfile?.isPrivate) && (
              <LockIcon
                className="h-3.5 w-3.5 text-label-tertiary"
                strokeWidth={1.8}
                aria-label="Private account"
              />
            )}
          </p>
          {currentUser.bio && (
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-label md:mx-0">
              {currentUser.bio}
            </p>
          )}

          <dl className="mt-6 flex justify-center divide-x divide-hairline md:justify-start">
            {displayStats.map((stat) => (
              <div key={stat.label} className="px-6 first:pl-0 last:pr-0">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-[19px] font-semibold tabular-nums tracking-[-0.02em]">
                  {stat.value}
                </dd>
                <span className="text-[13px] text-label-tertiary" aria-hidden="true">
                  {stat.label}
                </span>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap justify-center gap-2 md:justify-start">
            {isSelf ? (
              <>
                <Button
                  variant="glass"
                  size="md"
                  className="min-w-[140px]"
                  onClick={() => setEditing(true)}
                >
                  Edit profile
                </Button>
                <IconButton label={copied ? 'Link copied' : 'Share profile'} onClick={share}>
                  {copied ? (
                    <CheckIcon className="h-[18px] w-[18px] text-online" strokeWidth={2} />
                  ) : (
                    <ShareIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                  )}
                </IconButton>
                <IconButton
                  label="Log out"
                  onClick={logout}
                  className="text-danger hover:border-danger/40"
                >
                  <LogOutIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  variant={
                    followStatus === 'following'
                      ? 'glass'
                      : followStatus === 'requested'
                      ? 'glass'
                      : 'primary'
                  }
                  size="md"
                  className="min-w-[130px]"
                  onClick={handleToggleFollow}
                >
                  {followStatus === 'following'
                    ? 'Following'
                    : followStatus === 'requested'
                    ? 'Requested'
                    : 'Follow'}
                </Button>
                <Button
                  variant="glass"
                  size="md"
                  className="min-w-[120px]"
                  onClick={handleStartChat}
                >
                  <MessageCircleIcon className="mr-1.5 h-4 w-4" strokeWidth={1.8} />
                  Message
                </Button>
                <IconButton label={copied ? 'Link copied' : 'Share profile'} onClick={share}>
                  {copied ? (
                    <CheckIcon className="h-[18px] w-[18px] text-online" strokeWidth={2} />
                  ) : (
                    <ShareIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                  )}
                </IconButton>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Highlights / Story shortcut */}
      {isSelf && (
        <section aria-labelledby="highlights-heading" className="mt-12">
          <h2 id="highlights-heading" className="sr-only">
            Highlights
          </h2>
          <ul className="no-scrollbar -mx-5 flex gap-5 overflow-x-auto px-5 md:mx-0 md:px-0">
            <li className="shrink-0">
              <Link
                to="/story/new"
                className="flex w-[76px] flex-col items-center gap-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-dashed border-white/20 text-label-secondary transition-colors duration-150 hover:border-white/40 hover:text-label">
                  <PlusIcon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <span className="text-[12px] text-label-secondary">New</span>
              </Link>
            </li>
          </ul>
        </section>
      )}

      {/* Stories */}
      <section aria-label="Stories" className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <SegmentedControl options={tabs} value={tab} onChange={setTab} ariaLabel="Story view" />
          <p className="text-[13px] text-label-tertiary">
            {items.length} {items.length === 1 ? 'story' : 'stories'}
          </p>
        </div>
        {items.length > 0 ? (
          <ul className="mt-5 grid grid-cols-3 gap-2 md:gap-3">
            {items.map((s) => (
              <li
                key={s.id}
                className="group relative aspect-[9/16] overflow-hidden rounded-[18px] bg-surface ring-1 ring-white/[0.06]"
              >
                <img
                  src={s.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 ease-out-expo group-hover:scale-[1.03]"
                />
                <span
                  className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent"
                  aria-hidden="true"
                />
                <span className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[12px] font-medium text-white">
                  <EyeIcon className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                  {s.views}
                </span>
                <span
                  className={`absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur-md ${
                    s.active ? 'bg-iris/25 text-white' : 'bg-black/30 text-white/80'
                  }`}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={ImageOffIcon}
            title={tab === 'active' ? 'No active stories' : 'No archived stories'}
            body={
              tab === 'active'
                ? isSelf
                  ? 'Stories you share stay here for 24 hours.'
                  : `${currentUser.name} has no active stories.`
                : isSelf
                ? 'Stories automatically archive after they expire.'
                : 'No archived stories available.'
            }
          />
        )}
      </section>

      {isSelf && (
        <EditProfileSheet
          open={editing}
          user={currentUser}
          onClose={closeSheet}
          onSave={async (next) => {
            await updateProfile({
              fullName: next.name,
              bio: next.bio,
            });
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}
