import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { navItems } from '../../data/navigation';
import { useAuth } from '../../context/AuthContext';

export function TabBar() {
  const { stats } = useAuth();
  const hasUnread = (stats?.unreadNotificationsCount ?? 0) > 0;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),14px)] md:hidden"
    >
      <div className="glass-strong mx-auto flex h-16 max-w-md items-center gap-1 rounded-full px-1.5">
        {navItems
          .filter((item) => item.mobile)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                    isActive ? 'text-accent-soft' : 'text-label-secondary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="tab-active"
                        className="absolute inset-0 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        transition={{ type: 'spring', bounce: 0.18, duration: 0.35 }}
                      />
                    )}
                    <span className="relative">
                      <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 1.9 : 1.6} />
                      {item.badge === 'unread' && hasUnread && (
                        <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-accent glow-accent" />
                      )}
                    </span>
                    <span className="relative text-[10px] font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
      </div>
    </nav>
  );
}
