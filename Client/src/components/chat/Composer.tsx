import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpIcon, MicIcon, PlusIcon } from 'lucide-react';
import { attachmentOptions } from '../../data/attachments';
import { EmojiPickerButton } from './EmojiPickerButton';

type ComposerProps = {
  onSend: (text: string, file?: File) => void;
  onTyping?: () => void;
  recipient: string;
};

export function Composer({ onSend, onTyping, recipient }: ComposerProps) {
  const [value, setValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canSend = value.trim().length > 0;

  // Desktop keyboard shortcut: pressing '/' focuses message input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (window.innerWidth < 768) return;

      const target = document.activeElement as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onTyping?.();
  };

  const handleSelectEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (!input) {
      setValue((prev) => prev + emoji);
      return;
    }
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const nextVal = value.slice(0, start) + emoji + value.slice(end);
    setValue(nextVal);
    onTyping?.();

    requestAnimationFrame(() => {
      const newPos = start + emoji.length;
      input.selectionStart = newPos;
      input.selectionEnd = newPos;
      input.focus();
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    onSend(value.trim());
    setValue('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSend(value.trim(), file);
      setValue('');
    }
    e.target.value = '';
  };

  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-label="Add attachment"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="glass-pill flex h-12 w-12 items-center justify-center rounded-full text-label-secondary transition-[background-color,color] duration-150 hover:bg-white/[0.1] hover:text-label focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <motion.span
            animate={{ rotate: menuOpen ? 45 : 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <PlusIcon className="h-5 w-5" strokeWidth={1.7} />
          </motion.span>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              style={{ transformOrigin: 'bottom left' }}
              className="glass-strong absolute bottom-14 left-0 z-20 w-56 rounded-[22px] p-1.5"
            >
              {attachmentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      if (option.id === 'photo') {
                        fileInputRef.current?.click();
                      }
                    }}
                    className="flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left text-[14px] text-label transition-colors duration-150 hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06]">
                      <Icon className={`h-4 w-4 ${option.tint}`} strokeWidth={1.7} />
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <label className="glass-pill flex h-12 flex-1 items-center gap-2 rounded-full pl-2.5 pr-1.5 transition-[box-shadow,border-color] duration-200 focus-within:border-accent/40 focus-within:shadow-[0_0_0_4px_rgba(90,130,255,0.14)]">
        <EmojiPickerButton onSelect={handleSelectEmoji} />
        <span className="sr-only">Message {recipient}</span>
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          placeholder="Message (press / to focus)"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-label outline-none placeholder:text-label-tertiary"
        />

        <AnimatePresence mode="popLayout" initial={false}>
          {canSend ? (
            <motion.button
              key="send"
              type="submit"
              aria-label="Send message"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              whileTap={{ scale: 0.92 }}
              className="btn-accent flex h-9 w-9 items-center justify-center rounded-full"
            >
              <ArrowUpIcon className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </motion.button>
          ) : (
            <motion.button
              key="mic"
              type="button"
              aria-label="Record voice message"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-label-secondary transition-colors duration-150 hover:text-label"
            >
              <MicIcon className="h-5 w-5" strokeWidth={1.6} />
            </motion.button>
          )}
        </AnimatePresence>
      </label>
    </form>
  );
}
