import React from 'react';
import { motion } from 'framer-motion';

export function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      style={{ transformOrigin: 'bottom left' }}
      className="mt-4 flex"
      aria-label="Typing"
      role="status">
      
      <span className="bubble-received flex h-10 items-center gap-1.5 rounded-[22px] rounded-bl-[8px] px-4">
        {[0, 1, 2].map((i) =>
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-label-secondary"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.16 }} />

        )}
      </span>
    </motion.div>);

}