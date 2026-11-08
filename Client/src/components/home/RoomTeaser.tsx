import React from 'react';
import { Link } from 'react-router-dom';
import { VenetianMaskIcon } from 'lucide-react';
import { buttonStyles } from '../Button';

export function RoomTeaser() {
  return (
    <section aria-labelledby="room-teaser" className="glass rounded-[24px] p-6">
      <VenetianMaskIcon className="h-6 w-6 text-iris-soft" strokeWidth={1.5} aria-hidden="true" />
      <h2 id="room-teaser" className="mt-5 text-[17px] font-semibold tracking-[-0.015em]">
        Anonymous rooms
      </h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-label-secondary">
        Talk without names. Rooms disappear when everyone leaves.
      </p>
      <p className="mt-5 font-mono text-[18px] tracking-[0.2em] text-label-tertiary" aria-hidden="true">
        ••• ••• •••
      </p>
      <Link to="/rooms" className={`${buttonStyles('glass', 'md')} mt-5 w-full`}>
        Open a room
      </Link>
    </section>);

}