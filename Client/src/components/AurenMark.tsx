import React from 'react';

export function AurenMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="glass-pill inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 20 20" fill="none">
        <defs>
          <linearGradient id="auren-mark" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#93ADFF" />
            <stop offset="1" stopColor="#C9B8FF" />
          </linearGradient>
        </defs>
        <circle cx="10" cy="10" r="7.25" stroke="url(#auren-mark)" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="2.5" fill="url(#auren-mark)" />
      </svg>
    </span>
  );
}

