import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SendIcon, UsersIcon, XIcon, ShieldCheckIcon } from 'lucide-react';
import { getSocket } from '../../services/socket';
import { RoomDetails } from '../../services/rooms';
import { EmojiPickerButton } from '../chat/EmojiPickerButton';

interface MessageItem {
  id: string;
  alias: string;
  content: string;
  createdAt: string | Date;
}

interface AnonymousRoomChatProps {
  room: RoomDetails;
  onClose: () => void;
}

export function AnonymousRoomChat({ room, onClose }: AnonymousRoomChatProps) {
  const [messages, setMessages] = useState<MessageItem[]>(
    (room.messages as any[]) || []
  );
  const [input, setInput] = useState('');
  const [peopleCount, setPeopleCount] = useState(room.participantsCount || 1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectEmoji = (emoji: string) => {
    const inputEl = inputRef.current;
    if (!inputEl) {
      setInput((prev) => prev + emoji);
      return;
    }
    const start = inputEl.selectionStart ?? input.length;
    const end = inputEl.selectionEnd ?? input.length;
    const nextVal = input.slice(0, start) + emoji + input.slice(end);
    setInput(nextVal);

    requestAnimationFrame(() => {
      const newPos = start + emoji.length;
      inputEl.selectionStart = newPos;
      inputEl.selectionEnd = newPos;
      inputEl.focus();
    });
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('join_anonymous_room', {
      code: room.code,
      alias: room.alias,
    });

    const handleNewMessage = (msg: MessageItem) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleUserJoined = (data: { alias: string; peopleCount: number }) => {
      setPeopleCount(data.peopleCount);
    };

    const handleUserLeft = (data: { alias: string; peopleCount: number }) => {
      setPeopleCount(data.peopleCount);
    };

    socket.on('new_room_message', handleNewMessage);
    socket.on('room_user_joined', handleUserJoined);
    socket.on('room_user_left', handleUserLeft);

    return () => {
      socket.emit('leave_anonymous_room', {
        code: room.code,
        alias: room.alias,
      });
      socket.off('new_room_message', handleNewMessage);
      socket.off('room_user_joined', handleUserJoined);
      socket.off('room_user_left', handleUserLeft);
    };
  }, [room.code, room.alias]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('send_room_message', {
        code: room.code,
        alias: room.alias,
        content: input.trim(),
      });
    }

    setInput('');
  };

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          className="glass-strong flex h-[90vh] w-full max-w-2xl flex-col rounded-[32px] overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] font-semibold tracking-wider text-iris-soft uppercase">
                  {room.code}
                </span>
                <span className="text-label-tertiary">·</span>
                <span className="flex items-center gap-1 text-[13px] text-label-secondary">
                  <UsersIcon className="h-3.5 w-3.5" />
                  {peopleCount} inside
                </span>
              </div>
              <p className="mt-0.5 text-[15px] font-semibold text-white">
                Speaking as <span className="text-iris-soft">{room.alias}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white hover:bg-white/[0.12] transition-colors"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </header>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3"
          >
            <div className="mx-auto flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3.5 py-1.5 text-[12px] text-label-tertiary">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-online" />
              Messages evaporate automatically when the room closes
            </div>

            {messages.map((m, i) => {
              const isMe = m.alias === room.alias;
              return (
                <div
                  key={m.id || i}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[11px] font-mono text-label-tertiary px-1 mb-0.5">
                    {isMe ? 'You' : m.alias}
                  </span>
                  <div
                    className={`max-w-[75%] rounded-[18px] px-4 py-2.5 text-[15px] ${
                      isMe
                        ? 'bubble-sent text-white rounded-br-sm'
                        : 'bubble-received text-label rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="border-t border-hairline p-4 flex items-center gap-2"
          >
            <div className="glass-pill flex flex-1 items-center gap-2 rounded-full pl-2.5 pr-4 py-1.5 focus-within:border-accent/40">
              <EmojiPickerButton onSelect={handleSelectEmoji} />
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message as ${room.alias}…`}
                className="flex-1 bg-transparent py-1.5 text-[15px] text-white outline-none placeholder:text-label-tertiary"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className="btn-accent flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-40 transition-transform active:scale-95 shrink-0"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

