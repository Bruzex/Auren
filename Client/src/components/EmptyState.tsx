import React from "react";
import { BoxIcon } from "lucide-react";
type EmptyStateProps = {
  icon: BoxIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  compact?: boolean;
};
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  compact = false
}: EmptyStateProps) {
  return <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-10' : 'py-16'}`}>
      <div className="relative flex h-24 w-24 items-center justify-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border border-white/[0.05]" />
        <span className="absolute inset-3 rounded-full border border-white/[0.07]" />
        <span className="glass-pill relative flex h-12 w-12 items-center justify-center rounded-full">
          <Icon className="h-5 w-5 text-label-secondary" strokeWidth={1.6} />
        </span>
      </div>
      <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.015em]">{title}</h3>
      {body && <p className="mt-1.5 max-w-xs text-[14px] leading-relaxed text-label-secondary">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>;
}