import React, { useState } from 'react';
import { VenetianMaskIcon } from 'lucide-react';
import { CreateRoomCard } from '../components/rooms/CreateRoomCard';
import { JoinRoomCard } from '../components/rooms/JoinRoomCard';
import { AnonymousRoomChat } from '../components/rooms/AnonymousRoomChat';
import { roomPrinciples } from '../data/rooms';
import { roomService, RoomDetails } from '../services/rooms';

export function AnonymousRooms() {
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [activeChatRoom, setActiveChatRoom] = useState<RoomDetails | null>(null);

  const handleEnterCreatedRoom = async (code: string) => {
    try {
      const room = await roomService.joinRoom(code);
      setActiveChatRoom(room);
    } catch (err) {
      console.warn('Failed to enter room:', err);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <div className="pointer-events-none absolute inset-0 bg-black/45" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-[1000px] px-5 pb-32 pt-[max(env(safe-area-inset-top),32px)] md:px-8 md:pb-14 md:pt-16">
        <header className="max-w-xl">
          <VenetianMaskIcon className="h-7 w-7 text-iris-soft" strokeWidth={1.4} aria-hidden="true" />
          <h1 className="mt-6 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] md:text-[44px]">
            Anonymous rooms
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed text-label-secondary">
            No names, no history. A room exists only as long as someone is inside.
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 md:gap-5">
          <CreateRoomCard
            code={createdCode}
            onCreate={setCreatedCode}
            onEnter={handleEnterCreatedRoom}
          />
          <JoinRoomCard
            createdCode={createdCode}
            onOpenRoomChat={(room) => setActiveChatRoom(room)}
          />
        </div>

        <dl className="mt-12 grid gap-6 border-t border-hairline pt-8 sm:grid-cols-3">
          {roomPrinciples.map((p) => (
            <div key={p.title}>
              <dt className="text-[14px] font-medium text-label">{p.title}</dt>
              <dd className="mt-1 text-[14px] leading-relaxed text-label-tertiary">{p.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      {activeChatRoom && (
        <AnonymousRoomChat
          room={activeChatRoom}
          onClose={() => setActiveChatRoom(null)}
        />
      )}
    </div>
  );
}
