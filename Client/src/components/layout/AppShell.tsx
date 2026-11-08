import React, { useEffect } from 'react';
import { Outlet, useLocation, useMatch } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';

export function AppShell() {
  const { pathname } = useLocation();
  const inThread = useMatch('/chats/:conversationId');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="relative min-h-screen w-full bg-canvas text-label">
      <div className="ambient" aria-hidden="true" />
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      {!inThread && <TabBar />}
      <div className="noise" aria-hidden="true" />
    </div>);

}