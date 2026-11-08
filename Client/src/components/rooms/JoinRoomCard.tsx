import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { KeyRoundIcon, LoaderCircleIcon } from 'lucide-react';
import { Button } from '../Button';
import { formatRoomCode, normalizeRoomCode } from '../../utils/roomCode';
import { roomService, RoomDetails } from '../../services/rooms';

type JoinStatus = 'idle' | 'joining' | 'error' | 'joined';

type JoinRoomCardProps = {
  createdCode: string | null;
  onOpenRoomChat?: (roomData: RoomDetails) => void;
};

const ease = [0.23, 1, 0.32, 1] as const;

export function JoinRoomCard({ createdCode, onOpenRoomChat }: JoinRoomCardProps) {
  const [raw, setRaw] = useState('');
  const [status, setStatus] = useState<JoinStatus>('idle');
  const [alias, setAlias] = useState('');
  const [roomData, setRoomData] = useState<RoomDetails | null>(null);
  const [recentRooms, setRecentRooms] = useState<Array<{ code: string; name: string; people: number }>>([]);

  useEffect(() => {
    roomService
      .getRecentRooms()
      .then((data) => setRecentRooms(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (createdCode) {
      setRaw(normalizeRoomCode(createdCode));
    }
  }, [createdCode]);

  const join = async (e?: React.FormEvent, codeToJoin = raw) => {
    e?.preventDefault();
    const clean = normalizeRoomCode(codeToJoin);
    if (clean.length < 5) return;

    setStatus('joining');
    try {
      const res = await roomService.joinRoom(clean);
      setAlias(res.alias || 'Anonymous User');
      setRoomData(res);
      setStatus('joined');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <section
      aria-labelledby="join-room-title"
      className="glass flex min-h-[380px] flex-col rounded-[30px] p-6 md:p-8"
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === 'joined' ? (
          <motion.div
            key="joined"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease }}
            className="flex flex-1 flex-col"
          >
            <h2 id="join-room-title" className="text-[15px] font-medium text-label-secondary">
              You’re in
            </h2>
            <p className="mt-6 text-[13px] text-label-tertiary">Others will see you as</p>
            <p className="mt-1 font-mono text-[32px] font-medium tracking-[0.04em] text-iris-soft">
              {alias}
            </p>
            <p className="mt-3 font-mono text-[14px] tracking-[0.14em] text-label-tertiary">
              {formatRoomCode(raw)}
            </p>
            <div className="mt-auto flex gap-2 pt-6">
              <Button
                variant="glass"
                size="lg"
                className="flex-1"
                onClick={() => {
                  setStatus('idle');
                  setRaw('');
                  setRoomData(null);
                }}
              >
                Leave
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => roomData && onOpenRoomChat?.(roomData)}
              >
                Open chat
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={(e) => join(e)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease }}
            className="flex flex-1 flex-col"
          >
            <span className="glass-pill flex h-12 w-12 items-center justify-center rounded-full">
              <KeyRoundIcon
                className="h-5 w-5 text-accent-soft"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </span>
            <h2 id="join-room-title" className="mt-6 text-[24px] font-semibold tracking-[-0.025em]">
              Join a room
            </h2>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-label-secondary">
              Enter the room code someone shared with you.
            </p>

            <label htmlFor="room-code" className="sr-only">
              Room code
            </label>
            <input
              id="room-code"
              value={formatRoomCode(raw)}
              onChange={(e) => {
                setRaw(normalizeRoomCode(e.target.value));
                if (status === 'error') setStatus('idle');
              }}
              placeholder="XXX-XXX"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={status === 'error'}
              aria-describedby="room-code-hint"
              className={`mt-7 h-16 w-full rounded-[20px] border bg-black/30 px-5 text-center font-mono text-[24px] font-medium uppercase tracking-[0.22em] text-label shadow-[inset_0_2px_12px_rgba(0,0,0,0.5)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-label-quaternary focus:shadow-[0_0_0_4px_rgba(90,130,255,0.16),inset_0_2px_12px_rgba(0,0,0,0.5)] ${
                status === 'error'
                  ? 'border-danger/50'
                  : 'border-white/[0.06] focus:border-accent/40'
              }`}
            />

            <p
              id="room-code-hint"
              className={`mt-2.5 min-h-[20px] text-[13px] ${
                status === 'error' ? 'text-danger' : 'text-label-tertiary'
              }`}
              role={status === 'error' ? 'alert' : undefined}
            >
              {status === 'error'
                ? 'No active room with this code. It may have expired.'
                : 'Codes aren’t case-sensitive.'}
            </p>

            {recentRooms.length > 0 && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium">{recentRooms[0].name}</p>
                  <p className="font-mono text-[12px] tracking-[0.1em] text-label-tertiary">
                    {formatRoomCode(recentRooms[0].code)} · {recentRooms[0].people} inside
                  </p>
                </div>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    setRaw(recentRooms[0].code);
                    join(undefined, recentRooms[0].code);
                  }}
                >
                  Rejoin
                </Button>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-auto w-full"
              disabled={raw.length < 5 || status === 'joining'}
            >
              {status === 'joining' ? (
                <>
                  <LoaderCircleIcon
                    className="h-4 w-4 animate-spin"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Connecting
                </>
              ) : (
                'Join room'
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}
