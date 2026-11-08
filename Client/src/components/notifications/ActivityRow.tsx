import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../Avatar';
import { getUser } from '../../utils/users';
import type { Activity } from '../../types/social';

type ActivityRowProps = {
  activity: Activity;
  trailing?: React.ReactNode;
};

export function ActivityRow({ activity, trailing }: ActivityRowProps) {
  const actors = activity.userIds.map(getUser);
  const primaryActor = actors[0];

  return (
    <div className="flex items-center gap-3.5 px-3 py-3">
      {primaryActor ? (
        <Link
          to={`/profile/${primaryActor.username || primaryActor.id}`}
          className="shrink-0 hover:opacity-90 transition-opacity focus-visible:outline-none"
        >
          {actors.length > 1 ? (
            <span className="relative block h-12 w-12" aria-hidden="true">
              <span className="absolute left-0 top-0">
                <Avatar user={actors[0]} size={34} />
              </span>
              <span className="absolute bottom-0 right-0 rounded-full ring-[3px] ring-[#121218]">
                <Avatar user={actors[1]} size={34} />
              </span>
            </span>
          ) : (
            <Avatar user={actors[0]} size={48} />
          )}
        </Link>
      ) : null}

      <p className="min-w-0 flex-1 text-[14px] leading-[1.45] text-label-secondary">
        {actors.map((actor, i) => (
          <React.Fragment key={actor.id}>
            <Link
              to={`/profile/${actor.username || actor.id}`}
              className="font-semibold text-label hover:text-accent-soft hover:underline transition-colors focus-visible:outline-none"
            >
              {actor.username}
            </Link>
            {i < actors.length - 1 &&
              (activity.othersCount || i < actors.length - 2 ? ', ' : ' and ')}
          </React.Fragment>
        ))}
        {activity.othersCount ? <> and {activity.othersCount} others</> : null} {activity.text}
        <span className="text-label-tertiary"> · {activity.time}</span>
      </p>

      {activity.thumb ? (
        <img
          src={activity.thumb}
          alt=""
          className="h-14 w-10 shrink-0 rounded-[10px] object-cover ring-1 ring-white/10"
        />
      ) : (
        trailing
      )}
    </div>
  );
}