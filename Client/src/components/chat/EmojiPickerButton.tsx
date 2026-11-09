import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SmileIcon } from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys',
    emojis: [
      '😀', '😂', '🥹', '😍', '🥰', '😎', '🤩', '🥳', '🤔', '🤫',
      '🫠', '😭', '🥺', '😏', '😌', '😋', '😜', '🤪', '😴', '😷',
      '🤯', '🤓', '🤠', '😬', '😮', '😱', '🥱', '😤', '😡', '💀',
    ],
  },
  {
    id: 'gestures',
    name: 'Hands',
    emojis: [
      '👍', '👎', '👏', '🙌', '🫶', '✌️', '🤞', '🫰', '🤟', '🤙',
      '👋', '🤝', '🙏', '👊', '✊', '🤛', '🤜', '💪', '💅', '✍️',
    ],
  },
  {
    id: 'vibes',
    name: 'Vibes',
    emojis: [
      '🔥', '✨', '⚡', '💯', '❤️', '💖', '💗', '💓', '💕', '💘',
      '💔', '🌟', '💫', '🎉', '🥂', '🍾', '☕', '🍕', '🚀', '💎',
    ],
  },
];

interface EmojiPickerButtonProps {
  onSelect: (emoji: string) => void;
  className?: string;
  buttonSize?: 'sm' | 'md';
}

export function EmojiPickerButton({
  onSelect,
  className = '',
  buttonSize = 'md',
}: EmojiPickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Outside click & ESC detection
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses =
    buttonSize === 'sm'
      ? 'h-8 w-8 text-label-secondary'
      : 'h-9 w-9 text-label-secondary';

  return (
    <div ref={containerRef} className={`relative flex items-center shrink-0 ${className}`}>
      <button
        type="button"
        aria-label="Add emoji"
        aria-expanded={isOpen}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`glass-pill flex items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 hover:bg-white/[0.1] hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${sizeClasses}`}
      >
        <SmileIcon className="h-4 w-4" strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.94 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'bottom left' }}
            className="glass-strong absolute bottom-12 left-0 z-40 w-72 rounded-[24px] border border-white/10 p-3 shadow-2xl backdrop-blur-2xl"
          >
            {/* Category tabs */}
            <div className="flex items-center gap-1 border-b border-hairline pb-2 mb-2 px-1">
              {EMOJI_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(idx)}
                  className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    activeCategory === idx
                      ? 'bg-white/[0.12] text-white shadow-sm'
                      : 'text-label-tertiary hover:text-label'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Emoji grid */}
            <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto thin-scroll p-1">
              {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(emoji);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[20px] transition-transform duration-100 hover:scale-125 hover:bg-white/[0.08] active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

