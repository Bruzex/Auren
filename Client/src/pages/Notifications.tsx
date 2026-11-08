import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserRoundCheckIcon } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { UserRow } from '../components/UserRow';
import { Button } from '../components/Button';
import { FollowButton } from '../components/FollowButton';
import { ActivityRow } from '../components/notifications/ActivityRow';
import { EmptyState } from '../components/EmptyState';
import { userService } from '../services/users';
import { notificationService } from '../services/notifications';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { getUser } from '../utils/users';
import type { FollowRequest, Activity, FollowStatus, User } from '../types/social';

const groups = ['Today', 'This week'] as const;

export function Notifications() {
  const { refreshUser } = useAuth();
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [activitiesList, setActivitiesList] = useState<Activity[]>([]);
  const [accepted, setAccepted] = useState(0);
  const [followBack, setFollowBack] = useState<Record<string, FollowStatus>>({});

  const loadNotifications = useCallback(async () => {
    try {
      const [reqs, acts] = await Promise.all([
        userService.getPendingRequests(),
        notificationService.getNotifications(),
      ]);
      setRequests(reqs);
      setActivitiesList(acts);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    const socket = getSocket();
    if (!socket) return;

    socket.on('new_notification', loadNotifications);
    return () => {
      socket.off('new_notification', loadNotifications);
    };
  }, [loadNotifications]);

  const resolve = async (id: string, accept: boolean) => {
    // Optimistic UI update
    setRequests((prev) => prev.filter((r) => r.id !== id));
    if (accept) setAccepted((n) => n + 1);

    try {
      if (accept) {
        await userService.acceptFollowRequest(id);
      } else {
        await userService.rejectFollowRequest(id);
      }
      await refreshUser();
    } catch {
      await loadNotifications();
    }
  };

  const toggleFollowBack = async (actorId: string) => {
    const current = followBack[actorId] || 'follow';
    const next: FollowStatus = current === 'following' ? 'follow' : 'following';
    setFollowBack((prev) => ({ ...prev, [actorId]: next }));

    try {
      const real = await userService.toggleFollow(actorId);
      setFollowBack((prev) => ({ ...prev, [actorId]: real }));
    } catch {
      setFollowBack((prev) => ({ ...prev, [actorId]: current }));
    }
  };

  return (
    <div className="mx-auto w-full max-w-[720px] px-5 pb-32 pt-[max(env(safe-area-inset-top),24px)] md:px-8 md:pb-12 md:pt-10">
      <PageHeader
        title="Activity"
        subtitle="Requests and what’s happening around your stories."
      />

      <section aria-labelledby="requests-heading" className="mt-9">
        <div className="mb-3 flex items-center gap-2 px-1">
          <h2 id="requests-heading" className="text-[17px] font-semibold tracking-[-0.015em]">
            Follow requests
          </h2>
          {requests.length > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent/20 px-1.5 text-[11px] font-semibold tabular-nums text-accent-soft">
              {requests.length}
            </span>
          )}
        </div>
        <div className="glass rounded-[26px] p-2">
          <AnimatePresence initial={false}>
            {requests.map((request) => {
              const user: User = request.user || getUser(request.userId);
              return (
                <motion.div
                  key={request.id}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden"
                >
                  <UserRow
                    user={user}
                    meta={user.mutuals ? `${user.mutuals} mutual` : request.time}
                    trailing={
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          onClick={() => resolve(request.id, true)}
                          aria-label={`Accept ${user.name}`}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="glass"
                          onClick={() => resolve(request.id, false)}
                          aria-label={`Decline ${user.name}`}
                        >
                          Decline
                        </Button>
                      </div>
                    }
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          {requests.length === 0 && (
            <EmptyState
              compact
              icon={UserRoundCheckIcon}
              title="All caught up"
              body={
                accepted > 0
                  ? `You accepted ${accepted} ${accepted === 1 ? 'request' : 'requests'}.`
                  : 'New requests will appear here.'
              }
            />
          )}
        </div>
      </section>

      {groups.map((group) => {
        const groupActivities = activitiesList.filter((a) => a.group === group);
        if (groupActivities.length === 0) return null;

        return (
          <section key={group} aria-labelledby={`group-${group}`} className="mt-10">
            <h2
              id={`group-${group}`}
              className="mb-3 px-1 text-[17px] font-semibold tracking-[-0.015em]"
            >
              {group}
            </h2>
            <div className="glass divide-y divide-hairline rounded-[26px] p-2">
              {groupActivities.map((activity) => {
                const actorId = activity.userIds[0] || '';
                const actorName = activity.user?.name || getUser(actorId).name;

                return (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    trailing={
                      activity.kind === 'follow' ? (
                        <FollowButton
                          status={followBack[actorId] ?? 'follow'}
                          name={actorName}
                          onToggle={() => toggleFollowBack(actorId)}
                        />
                      ) : undefined
                    }
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
