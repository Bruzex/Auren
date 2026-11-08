import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, CopyIcon, RefreshCwIcon, SparklesIcon, Loader2Icon } from 'lucide-react';
import { Button } from '../Button';
import { SegmentedControl } from '../SegmentedControl';
import { roomDurations } from '../../data/rooms';
import { splitRoomCode } from '../../utils/roomCode';
import { roomService } from '../../services/rooms';

type Duration = (typeof roomDurations)[number]['value'];

type CreateRoomCardProps = {
  code: string | null;
  onCreate: (code: string | null) => void;
  onEnter?: (code: string) => void;
};

const ease = [0.23, 1, 0.32, 1] as const;

export function CreateRoomCard({ code, onCreate, onEnter }: CreateRoomCardProps) {
  const [duration, setDuration] = useState<Duration>('24h');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const durationLabel = roomDurations.find((d) => d.value === duration)?.label ?? '';

  const copy = () => {
    if (!code) return;
    navigator.clipboard?.writeText(code).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const res = await roomService.createRoom('Secret Room', duration);
      onCreate(res.code);
    } catch (err) {
      console.warn('Failed to create room:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      aria-labelledby="create-room-title"
      className="glass flex min-h-[380px] flex-col rounded-[30px] p-6 md:p-8"
    >
      <AnimatePresence mode="wait" initial={false}>
        {!code ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease }}
            className="flex flex-1 flex-col"
          >
            <span className="glass-pill flex h-12 w-12 items-center justify-center rounded-full">
              <SparklesIcon className="h-5 w-5 text-iris-soft" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h2 id="create-room-title" className="mt-6 text-[24px] font-semibold tracking-[-0.025em]">
              Create a room
            </h2>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-label-secondary">
              Open a private space and share the code. Everyone inside is anonymous.
            </p>
            <p className="mt-7 text-[13px] text-label-tertiary">Disappears after</p>
            <div className="mt-2">
              <SegmentedControl
                options={roomDurations}
                value={duration}
                onChange={setDuration}
                ariaLabel="Room duration"
              />
            </div>
            <Button
              size="lg"
              disabled={loading}
              className="mt-auto w-full"
              onClick={handleCreate}
            >
              {loading ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Creating Room…
                </>
              ) : (
                'Create room'
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease }}
            className="flex flex-1 flex-col"
          >
            <h2 id="create-room-title" className="text-[15px] font-medium text-label-secondary">
              Your room is open
            </h2>
            <div className="mt-6 rounded-[22px] border border-white/[0.06] bg-black/30 px-4 py-8 text-center shadow-[inset_0_2px_12px_rgba(0,0,0,0.5)]">
              <p className="sr-only">Room code {code.split('').join(' ')}</p>
              <p
                aria-hidden="true"
                className="flex items-center justify-center gap-3 font-mono text-[30px] font-medium tracking-[0.14em] text-label sm:text-[36px]"
              >
                {splitRoomCode(code).map((group, gi) => (
                  <React.Fragment key={gi}>
                    {gi > 0 && <span className="text-label-quaternary">·</span>}
                    <span>
                      {group.split('').map((ch, ci) => (
                        <motion.span
                          key={ci}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, ease, delay: (gi * 3 + ci) * 0.035 }}
                          className="inline-block"
                        >
                          {ch}
                        </motion.span>
                      ))}
                    </span>
                  </React.Fragment>
                ))}
              </p>
              <p className="mt-4 text-[13px] text-label-tertiary">
                Self-destructs in {durationLabel} · up to 12 people
              </p>
            </div>
            <div className="mt-auto flex gap-2 pt-6">
              <Button variant="glass" size="lg" className="flex-1" onClick={copy}>
                {copied ? (
                  <CheckIcon className="h-4 w-4 text-online" strokeWidth={2} />
                ) : (
                  <CopyIcon className="h-4 w-4" strokeWidth={1.7} />
                )}
                {copied ? 'Copied' : 'Copy code'}
              </Button>
              <Button size="lg" className="flex-1" onClick={() => onEnter?.(code)}>
                Enter room
              </Button>
            </div>
            <button
              type="button"
              onClick={() => onCreate(null)}
              className="mx-auto mt-4 flex items-center gap-1.5 text-[13px] text-label-tertiary transition-colors duration-150 hover:text-label"
            >
              <RefreshCwIcon className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
              Close and start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
