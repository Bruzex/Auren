import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOutIcon } from 'lucide-react';
import { AurenMark } from '../AurenMark';
import { Avatar } from '../Avatar';
import { navItems } from '../../data/navigation';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { user, stats, logout } = useAuth();

  const badgeCounts = {
    unread: 0,
    requests: stats?.unreadNotificationsCount ?? 0,
  };

  const currentUser = user || {
    id: 'guest',
    name: 'Guest',
    username: 'guest',
  };

  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 p-3 md:block md:w-[92px] lg:w-[268px]">
      <div className="glass flex h-full flex-col rounded-[28px] p-3 lg:p-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-2xl px-2 py-2 md:justify-center lg:justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <AurenMark />
          <span className="hidden text-[19px] font-semibold tracking-[-0.025em] lg:inline">
            Auren
          </span>
        </Link>

        <nav aria-label="Primary" className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const count = item.badge ? badgeCounts[item.badge] : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                aria-label={item.label}
                className={({ isActive }) =>
                  `relative flex h-12 items-center gap-3.5 rounded-2xl px-3.5 text-[15px] transition-colors duration-150 md:justify-center lg:justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                    isActive
                      ? 'text-label'
                      : 'text-label-secondary hover:bg-white/[0.04] hover:text-label'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-2xl bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                      />
                    )}
                    <span className="relative">
                      <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 1.9 : 1.6} />
                      {count > 0 && (
                        <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-accent glow-accent lg:hidden" />
                      )}
                    </span>
                    <span className="relative hidden flex-1 font-medium lg:inline">
                      {item.label}
                    </span>
                    {count > 0 && (
                      <span className="relative hidden h-5 min-w-[20px] items-center justify-center rounded-full bg-accent/20 px-1.5 text-[11px] font-semibold tabular-nums text-accent-soft lg:flex">
                        {count}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto flex items-center justify-between gap-1 rounded-2xl p-1.5 transition-colors duration-150 hover:bg-white/[0.04]">
          <Link
            to="/profile"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 md:justify-center lg:justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <Avatar user={currentUser} size={36} online />
            <span className="hidden min-w-0 lg:block">
              <span className="block truncate text-[14px] font-medium">{currentUser.name}</span>
              <span className="block truncate text-[12px] text-label-tertiary">
                @{currentUser.username}
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={logout}
            title="Log Out"
            aria-label="Log out"
            className="hidden h-9 w-9 items-center justify-center rounded-xl text-label-tertiary transition-colors hover:bg-white/[0.08] hover:text-danger lg:flex"
          >
            <LogOutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
