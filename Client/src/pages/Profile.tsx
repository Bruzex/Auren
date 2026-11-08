import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, EyeIcon, ImageOffIcon, LockIcon, PlusIcon, ShareIcon, LogOutIcon } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { SegmentedControl } from '../components/SegmentedControl';
import { EmptyState } from '../components/EmptyState';
import { EditProfileSheet } from '../components/profile/EditProfileSheet';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/stories';
import { highlights } from '../data/profile';
import type { ArchivedStory, User } from '../types/social';

type Tab = 'active' | 'archive';

const tabs = [
  { value: 'active', label: 'Active' },
  { value: 'archive', label: 'Archive' },
] as const;

export function Profile() {
  const { user: authUser, stats, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>('active');
  const [stories, setStories] = useState<ArchivedStory[]>([]);

  const user: User = authUser || {
    id: 'unknown',
    name: 'Unknown',
    username: 'unknown',
  };

  const loadStories = useCallback(async () => {
    if (!user.id || user.id === 'unknown') return;
    try {
      const data = await storyService.getUserStories(user.id);
      setStories(data);
    } catch (err) {
      console.warn('Failed to load user stories:', err);
    }
  }, [user.id]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const items = stories.filter((s) => (tab === 'active' ? s.active : !s.active));
  const closeSheet = useCallback(() => setEditing(false), []);

  const share = () => {
    navigator.clipboard?.writeText(`https://auren.app/${user.username}`).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const profileStats = [
    { label: 'Followers', value: stats?.followersCount ?? 0 },
    { label: 'Following', value: stats?.followingCount ?? 0 },
    { label: 'Stories', value: stats?.storiesCount ?? stories.length },
  ];

  return (
    <div className="mx-auto w-full max-w-[880px] px-5 pb-32 pt-[max(env(safe-area-inset-top),32px)] md:px-8 md:pb-12 md:pt-14">
      <section className="flex flex-col items-center text-center md:flex-row md:items-center md:gap-12 md:text-left">
        <div className="glass shrink-0 rounded-full p-2">
          <Avatar user={user} size={132} />
        </div>
        <div className="mt-6 min-w-0 flex-1 md:mt-0">
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.028em]">
            {user.name}
          </h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-[15px] text-label-secondary md:justify-start">
            @{user.username}
            <LockIcon
              className="h-3.5 w-3.5 text-label-tertiary"
              strokeWidth={1.8}
              aria-label="Private account"
            />
          </p>
          {user.bio && (
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-label md:mx-0">
              {user.bio}
            </p>
          )}

          <dl className="mt-6 flex justify-center divide-x divide-hairline md:justify-start">
            {profileStats.map((stat) => (
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
            <IconButton label="Log out" onClick={logout} className="text-danger hover:border-danger/40">
              <LogOutIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </IconButton>
          </div>
        </div>
      </section>

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
          {highlights.map((h) => (
            <li key={h.id} className="shrink-0">
              <button
                type="button"
                className="flex w-[76px] flex-col items-center gap-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <span className="glass block rounded-full p-1">
                  <img src={h.cover} alt="" className="h-16 w-16 rounded-full object-cover" />
                </span>
                <span className="w-full truncate text-center text-[12px] text-label">
                  {h.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

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
                ? 'Stories you share stay here for 24 hours.'
                : 'Stories automatically archive after they expire.'
            }
          />
        )}
      </section>

      <EditProfileSheet
        open={editing}
        user={user}
        onClose={closeSheet}
        onSave={async (next) => {
          await updateProfile({
            fullName: next.name,
            bio: next.bio,
          });
          setEditing(false);
        }}
      />
    </div>
  );
}
