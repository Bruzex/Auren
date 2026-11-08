import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AurenMark } from '../AurenMark';

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-canvas">
        <div className="ambient" aria-hidden="true" />
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse">
            <AurenMark size={56} />
          </div>
          <p className="text-[14px] text-label-secondary">Loading Auren…</p>
        </div>
      </div>
    );
  }

  if (!user && !token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
}

